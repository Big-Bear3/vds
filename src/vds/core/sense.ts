import { getSensitiveObject, putRawAndSensitiveObjects, setRootHolderAndPosition } from './mapping';
import { isWritableState } from './rw';
import { objectCanSensitise, isCollectionObject, isVdsKey } from './utils';

export const generalProxyHandler: ProxyHandler<any> = {
    defineProperty(target: any, key: string | symbol, attributes: PropertyDescriptor): boolean {
        if (!isWritableState(target) && !isVdsKey(key)) return false;
        return Reflect.defineProperty(target, key, attributes);
    },

    deleteProperty(target: any, key: string | symbol): boolean {
        if (!isWritableState(target) && !isVdsKey(key)) return false;
        return Reflect.deleteProperty(target, key);
    },

    set(target: any, key: string | symbol, value: any, receiver: any): boolean {
        if (!isWritableState(target) && !isVdsKey(key)) return false;
        return Reflect.set(target, key, value, receiver);
    },

    setPrototypeOf(): boolean {
        console.error('禁止设置Hold()装饰器装饰的对象的prototype！');
        return false;
    },

    get(target: any, key: string | symbol, receiver: any): any {
        const rawObj = Reflect.get(target, key, receiver);

        if (isVdsKey(key)) return rawObj;

        if (typeof rawObj === 'function') {
            console.error('Hold()装饰器装饰的对象中的元素不能是Function类型！');
            return rawObj;
        }

        const sensitiveObjStored = getSensitiveObject(rawObj);
        if (sensitiveObjStored) return sensitiveObjStored;

        if (!objectCanSensitise(rawObj)) return rawObj;

        return createSensitiveObject(rawObj, target, key);
    }
};

export const collectionProxyHandler: ProxyHandler<any> = {};

export function createSensitiveObject<T>(rawObj: T, rawObjHolder: any, rawObjKey: string | symbol): T {
    let targetProxyHandler: ProxyHandler<any>;
    if (isCollectionObject(rawObj)) {
        // TODO 后续支持集合类型
        console.error('Hold()装饰器装饰的对象中的元素暂不支持集合类型！');
        targetProxyHandler = collectionProxyHandler;
    } else {
        targetProxyHandler = generalProxyHandler;
    }

    const sensitiveObj = new Proxy(rawObj, targetProxyHandler);
    putRawAndSensitiveObjects(rawObj, sensitiveObj);

    setRootHolderAndPosition(rawObj, rawObjHolder, rawObjKey);

    return sensitiveObj;
}