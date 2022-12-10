module LocalStorage {
    export function set(key: string,data:Record<string,any>|any[]) {
        if(typeof window !== 'undefined') {
            const dt = JSON.stringify(data);
            window.localStorage.setItem(key,dt);
        }
    }
    export function get<D=Record<string,any>|any[]>(key: string,nullResult: 'object'|'array'='object') {
        if(typeof window !== 'undefined') {
            const data = window.localStorage.getItem(key);
            if(data !== null) {
                const dt = JSON.parse(data) as Partial<D>;
                return dt;
            }
        }
        return (nullResult==='object' ? {} : []) as unknown as Partial<D>
    }
    export function remove(key: string) {
        if(typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
        }
    }
}
export default LocalStorage;