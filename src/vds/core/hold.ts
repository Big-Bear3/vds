import { reactive } from 'vue';
import { lockWriteForRootHolder as lockWriteForRootHolder } from './rw';
import { createSensitiveObject } from './sense';
import { isCollectionObject } from './utils';

export function Hold(): PropertyDecorator {
    return function (target: any, key: string | symbol) {
        let _rootObj: any;
        Reflect.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get() {
                return _rootObj;
            },
            set(rootRawObj: any) {
                if (rootRawObj === undefined || rootRawObj === null) {
                    console.error('Hold()装饰器装饰的对象必须为非空的Object类型！');
                    return;
                }

                if (typeof rootRawObj !== 'object') {
                    console.error('Hold()装饰器装饰的对象必须是Object类型！');
                    return;
                }

                if (isCollectionObject(rootRawObj)) {
                    // TODO 后续支持集合类型
                    throw new Error('Hold()装饰器装饰的对象暂不支持集合类型！');
                }

                const sensitiveObject = createSensitiveObject(rootRawObj, this, key);
                _rootObj = reactive(sensitiveObject);

                lockWriteForRootHolder(this);
            }
        });
    };
}
