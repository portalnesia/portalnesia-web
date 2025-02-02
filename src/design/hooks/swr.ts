import nativeUseSWR, { SWRConfiguration } from "swr"
import nativeUseSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite';
import useAPI, { ApiError, PaginationResponse } from './api'
import { useSelector } from "@redux/store";
import { useCallback, useMemo } from "react";
import { portalUrl } from "@utils/main";

export type { SWRConfiguration };


export default function useSWR<D = any>(path: string | null, config: SWRConfiguration<D> = {}) {
    const { get } = useAPI();
    const ready = useSelector(s => s.ready);
    const { fallback, ...rest } = config
    const swr = nativeUseSWR<D, ApiError>(!ready ? null : path, {
        fetcher: get,
        revalidateOnReconnect: true,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        ...rest
    });
    return swr;
}

export function useSWRPagination<D extends PaginationResponse<any> = any>(path: string | null, options?: SWRInfiniteConfiguration<D, ApiError>) {
    const { get } = useAPI();
    const ready = useSelector(s => s.ready);

    const getKey = useCallback((index: number, previousPageData: PaginationResponse<D> | null) => {
        if (!path || !ready) return null;
        if ((previousPageData && (!previousPageData.data?.length || !previousPageData.can_load))) return null;
        const url = new URL(path, portalUrl());
        url.searchParams.set('page', String(index + 1));
        return `${url.pathname}?${url.searchParams.toString()}`
    }, [path, ready])

    const { data: dt, size, error, ...swr } = nativeUseSWRInfinite<D, ApiError>(getKey, get, {
        initialSize: 1,
        revalidateOnFocus: false,
        ...options
    });

    const data = useMemo(() => {
        if (!dt) return undefined;
        return dt?.reduce((prev, current) => {
            return {
                ...current,
                data: prev.data.concat(current.data)
            }
        });
    }, [dt])

    const isLoading = !data && !error;
    const isLoadingMore = isLoading || (size > 0 && dt && typeof dt[size - 1] === "undefined");

    return { data, size, error, isLoadingMore, ...swr, isLoading };
}