import { Hold } from '@/vds/core/hold';
import { rw } from '@/vds/core/rw';

export interface User {
    userName: string;
    tel: string;
    details: any;
}

export class MyStore {
    @Hold()
    private userFormData: User[] = [
        {
            userName: '张三',
            tel: '18866668888',
            details: [{ email: '1@1.com' }, { email: '2@2.com' }]
        }
    ];

    get userData(): User[] {
        return this.userFormData;
    }

    constructor() {
        setTimeout(() => {
            rw(this, () => {
                this.userFormData[0].userName = 'dd';
            });
        }, 1111);
    }
}
