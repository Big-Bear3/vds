import { reactive } from 'vue';
import { lockWriteForHolder } from './rw';
import { createSensitiveObject } from './sense';
import { objectCanSensitise, isCollectionObject } from './utils';

export function Hold(): PropertyDecorator {
    return function (target: any, key: string | symbol) {
        let _rootObj: any;
        Object.defineProperties(target, {
            [key]: {
                enumerable: true,
                configurable: true,
                get() {
                    return _rootObj;
                },
                set(rootRawObj: any) {
                    if (!objectCanSensitise(rootRawObj)) {
                        _rootObj = rootRawObj;
                        return;
                    }

                    if (isCollectionObject(rootRawObj)) {
                        // TODO 后续支持集合类型
                        throw new Error('Hold()装饰器装饰的对象暂不支持集合类型！');
                    }

                    const sensitiveObject = createSensitiveObject(rootRawObj, this, key);
                    _rootObj = reactive(sensitiveObject);

                    lockWriteForHolder(this);
                }
            }
        });
    };
}
