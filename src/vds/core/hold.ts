import { cloneDeep } from 'lodash';
import { reactive } from 'vue';
import { putReactiveAndSensitiveObjects } from './mapping';
import { isWritableState, lockWriteForRootHolder as lockWriteForRootHolder } from './rw';
import { createSensitiveObject } from './sense';
import { isCollectionObject, tryToSetValueToContent } from './utils';

export function Hold(): PropertyDecorator {
    const rootHolderToRootObj = new WeakMap<any, any>();

    return function (target: any, key: string | symbol) {
        Reflect.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get() {
                return rootHolderToRootObj.get(this);
            },
            set(rootRawObj: any) {
                const rootObj = rootHolderToRootObj.get(this);
                if (rootObj && !isWritableState(this, key)) return;

                if (rootRawObj === undefined || rootRawObj === null) {
                    console.error(`Hold()装饰器装饰的对象必须为非空的Object类型！(${<string>key} = ${rootRawObj})`);
                    return;
                }

                if (typeof rootRawObj !== 'object') {
                    const rootRawObjType = typeof rootRawObj;
                    console.error(
                        `Hold()装饰器装饰的对象必须是Object类型！(${<string>key} = ${
                            rootRawObjType === 'string' ? '"' + rootRawObj + '"' : rootRawObj
                        })`
                    );
                    return;
                }

                if (isCollectionObject(rootRawObj)) {
                    // TODO 后续支持集合类型
                    throw new Error(`Hold()装饰器装饰的对象暂不支持集合类型！`);
                }

                if (rootObj) {
                    const setValueToContentSuccessful = tryToSetValueToContent(rootRawObj, rootObj);
                    if (!setValueToContentSuccessful) {
                        console.error(
                            'Hold()装饰器装饰的对象重新赋值时，新值必须和原值同类型！\n新值：\n',
                            rootRawObj,
                            '\n原值：\n',
                            cloneDeep(rootObj)
                        );
                    }
                    return;
                }

                const sensitiveObject = createSensitiveObject(rootRawObj, this, key);
                const reactiveSensitiveRootObj = reactive(sensitiveObject);
                rootHolderToRootObj.set(this, reactiveSensitiveRootObj);

                putReactiveAndSensitiveObjects(reactiveSensitiveRootObj, sensitiveObject);

                lockWriteForRootHolder(this);
            }
        });
    };
}
