/*
 * Copyright (c) Portalnesia - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Putu Aditya <aditya@portalnesia.com>
 */

import React, {useCallback} from 'react'
import axios, {AxiosRequestConfig, AxiosError} from 'axios'
import {useSelector} from '@redux/store'
import API from '@utils/axios'
import useNotification from '@design/components/Notification'
import LocalStorage from '@utils/local-storage'
import {LocalConfig} from '@type/general'
import {getAppCheck} from '@utils/firebase'
import {getToken} from 'firebase/app-check'
import {EventEmitter} from "events"

type ApiErrorTypes = boolean | {
	name: string,
	code: number,
	description: string
}

export interface ResponseData<R = any> {
	error: ApiErrorTypes,
	data: R;
	message: string;
	error_description?: string
}

export type PaginationResponse<D, Other extends {} = {}> = {
	page: number,
	total_page: number,
	can_load: boolean,
	total: number,
	data: D[]
} & Other

class CatchApiError extends Error {
	data?: Record<string, any>

	constructor(dt: ResponseData<any>) {
		let msg = "";
		if (typeof dt?.error === 'boolean') {
			msg = dt?.message;
		} else if (typeof dt?.error_description === "string") {
			msg = dt?.error_description;
		} else {
			msg = dt?.error?.description;
		}
		super(msg);
		this.name = "CatchApiError";
		this.data = dt?.data;
	}
}

export class ApiError extends Error {
	data?: Record<string, any>

	constructor(msg?: string, data?: Record<string, any>) {
		super(msg);
		this.name = "ApiError";
		this.data = data;
	}
}

export class AppCheckError extends Error {}

type ApiOptions = {
	success_notif?: boolean
}
const defaultOptions: ApiOptions = {
	success_notif: true
}

class AppTokenProvider {
	loading = false;
	ev: EventEmitter;

	constructor() {
		this.ev = new EventEmitter();
		this.getToken = this.getToken.bind(this);
	}

	getToken() {
		return new Promise<string>((resolve, reject) => {
			if (!this.loading) {
				this.loading = true;
				const appCheck = getAppCheck();
				getToken(appCheck).then((token) => {
					resolve(token.token);
					this.ev.emit("token", token.token);
				}).catch((err) => {
					console.error("Get app token error", err)
					if (err instanceof Error) reject(new AppCheckError(err.message))
					else reject(err);
				}).finally(() => {
					this.loading = false;
				})
			} else {
				this.ev.once('token', resolve)
			}
		})
	}
}

const tokenProvider = new AppTokenProvider();

export default function useAPI() {
	const setNotif = useNotification();
	const {user} = useSelector(s => ({user: s.user}));

	const getHeaders = React.useCallback(async (config?: AxiosRequestConfig) => {
		try {
			const appToken = await tokenProvider.getToken();
			const localConfig = LocalStorage.get<LocalConfig>("config");
			const opt: AxiosRequestConfig = {
				withCredentials: true,
				...config,
				headers: {
					...(!user && localConfig && localConfig.sess ? {
						'X-Session-Id': localConfig.sess
					} : {}),
					...(appToken ? {
						'X-App-Token': appToken
					} : {}),
					...config?.headers,
				},
			}
			return opt;
		} catch (err) {
			console.error("Get app token error", err)
			throw err;
		}
	}, [user])

	const catchError = React.useCallback((e: any, options: ApiOptions) => {
		let msg = "Something went wrong";
		let data: Record<string, any> | undefined = undefined;
		if (e instanceof AppCheckError) {
			msg = e.message;
		}
		if (e instanceof CatchApiError) {
			data = e.data;
			if (typeof e?.message === 'string') {
				msg = e.message;
			} else {
				console.error(e);
				msg = "Something went wrong";
			}
		} else if (e instanceof AxiosError) {
			if (e?.response?.data?.data) {
				data = e?.response?.data?.data;
			}
			if (e?.code === 'ECONNABORTED') {
				msg = "Connection timeout"
			}
			if ((e?.response?.status && ![500, 503].includes(e?.response?.status)) && e?.response?.data?.error?.description) {
				msg = (e?.response?.data?.error?.description || "Something went wrong") as string
			}
			if ((e?.response?.status && ![500, 503].includes(e?.response?.status)) && typeof e?.response?.data.error === 'boolean') {
				msg = (e?.response?.data?.message || "Something went wrong") as string
			}
			if ((e?.response?.status && ![500, 503].includes(e?.response?.status)) && e?.response?.status == 440) {
				msg = "Token expired. Please refresh browser"
			}
			if (axios.isCancel(e)) {
				msg = "Canceled";
			}
		}
		if (process.env.NODE_ENV !== "production") console.error(e);
		return {msg, data}
	}, [])

	const get = React.useCallback(async <R = any>(url: string, option?: ApiOptions): Promise<R> => {
		const options: ApiOptions = {
			...(option ? option : {})
		}
		try {
			const opt = await getHeaders();
			const res = await API.get<ResponseData<R>>(url, opt);

			if (res?.data?.error) {
				throw new CatchApiError(res?.data)
			}
			return res.data.data;
		} catch (e: any) {
			const {msg, data} = catchError(e, options);
			throw new ApiError(msg, data);
		}
	}, [getHeaders, catchError]);

	const fetcher = useCallback((url: string) => {
		return get(url)
	}, [get])

	const del = React.useCallback(async <R = any>(url: string, option?: ApiOptions): Promise<R> => {
		const options: ApiOptions = {
			...defaultOptions,
			...(option ? option : {})
		}
		try {
			const opt = await getHeaders();
			const res = await API.delete<ResponseData<R>>(url, opt);

			if (res?.data?.error) {
				throw new CatchApiError(res?.data)
			}
			if (options?.success_notif) {
				setNotif(res.data.message, false)
			}
			return res.data.data;
		} catch (e: any) {
			const {msg, data} = catchError(e, options);
			throw new ApiError(msg, data);
		}
	}, [getHeaders, catchError, setNotif])

	const post = React.useCallback(async <R = any>(url: string, data: Record<string, any> | null | FormData, config?: AxiosRequestConfig, option?: ApiOptions): Promise<R> => {
		const options: ApiOptions = {
			...defaultOptions,
			...(option ? option : {})
		}
		const dt = data === null ? {} : data;
		try {
			const opt = await getHeaders(config);
			const res = await API.post<ResponseData<R>>(url, dt, opt);

			if (res?.data?.error) {
				throw new CatchApiError(res?.data)
			}
			if (options?.success_notif) {
				setNotif(res.data.message, false)
			}
			return res.data.data;
		} catch (e: any) {
			const {msg, data} = catchError(e, options);
			throw new ApiError(msg, data);
		}
	}, [getHeaders, setNotif, catchError]);

	const put = React.useCallback(async <R = any>(url: string, data: Record<string, any> | null | FormData, config?: AxiosRequestConfig, option?: ApiOptions): Promise<R> => {
		const options: ApiOptions = {
			...defaultOptions,
			...(option ? option : {})
		}
		const dt = data === null ? {} : data
		try {
			const opt = await getHeaders(config);
			const res = await API.put<ResponseData<R>>(url, dt, opt);

			if (res?.data?.error) {
				throw new CatchApiError(res?.data);
			}
			if (options?.success_notif) {
				setNotif(res.data.message, false)
			}
			return res.data.data;
		} catch (e: any) {
			const {msg, data} = catchError(e, options);
			throw new ApiError(msg, data);
		}
	}, [getHeaders, setNotif, catchError]);

	const patch = React.useCallback(async <R = any>(url: string, data: Record<string, any> | null | FormData, config?: AxiosRequestConfig, option?: ApiOptions): Promise<R> => {
		const options: ApiOptions = {
			...defaultOptions,
			...(option ? option : {})
		}
		const dt = data === null ? {} : data
		try {
			const opt = await getHeaders(config);
			const res = await API.patch<ResponseData<R>>(url, dt, opt);

			if (res?.data?.error) {
				throw new CatchApiError(res?.data);
			}
			if (options?.success_notif) {
				setNotif(res.data.message, false)
			}
			return res.data.data;
		} catch (e: any) {
			const {msg, data} = catchError(e, options);
			throw new ApiError(msg, data);
		}
	}, [getHeaders, setNotif, catchError]);

	return {
		get,
		post,
		put,
		patch,
		del,
		fetcher
	}
}