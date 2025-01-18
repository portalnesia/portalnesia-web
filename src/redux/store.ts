/*
 * Copyright (c) Portalnesia - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Putu Aditya <aditya@portalnesia.com>
 */

import {Dispatch, Store} from 'redux'
import {configureStore} from '@reduxjs/toolkit';
import thunk from 'redux-thunk'
import {createWrapper} from 'next-redux-wrapper';
import rootReducer from './reducers/root';
import type {ActionType, State} from '@type/redux'
import type {IPages} from '@type/general'
import {GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
import {ParsedUrlQuery} from 'querystring'
import {useDispatch as originalUseDispatch, useSelector as originalUseSelector} from 'react-redux'
import {createToken, verifyToken} from '@utils/main';
import {getDayJs} from "@utils/main";
import getDatabase from '@model/index';
import {Session} from '@model/session';
import {SessionGroup} from "@model/session";
import User, {UserAttribute} from '@model/user';
import {getCookie, setCookie} from 'cookies-next';
import {domainCookie} from '@src/config';
import {ResponseData} from '@design/hooks/api';
import {AxiosError} from "axios";

export const useDispatch = () => originalUseDispatch<Dispatch<ActionType>>()
export const useSelector = <D = State>(selector: (state: State) => D) => originalUseSelector<State, D>(selector)

export const makeStore = () => {
	const store = configureStore({
		reducer: rootReducer,
		middleware(getDefaultMiddleware) {
			return getDefaultMiddleware().concat(thunk)
		},
		devTools: process.env.NODE_ENV !== 'production',
	})
	if (process.env.NODE_ENV !== 'production' && (module as any)?.hot) {
		(module as any).hot.accept('./reducers/root', () => store.replaceReducer(rootReducer))
	}

	return store;
};

export const wrapperRoot = createWrapper(makeStore);

function stored(store: Store<State, ActionType> & { dispatch: Dispatch<ActionType> }, data: Partial<State>) {
	store.dispatch({
		type: 'CUSTOM',
		payload: {
			...data,
		}
	})
}

const redirect = <P>({req, res}: { req: GetServerSidePropsContext['req'], res: GetServerSidePropsContext['res'] }) => (destination?: string, message?: string) => {
	if (destination) {
		if (message) {
			setCookie("msg", message, {req, res, domain: domainCookie, sameSite: "lax"})
		}
		if (!(/localhost/.test(destination)) && process.env.NODE_ENV !== 'production') {
			return {
				notFound: true
			} as GetServerSidePropsResult<P>
		} else {
			return {
				redirect: {
					destination,
					permanent: false
				}
			} as GetServerSidePropsResult<P>
		}
	} else {
		return {
			notFound: true
		} as GetServerSidePropsResult<P>
	}
}

type CallbackParams<P extends {}> = GetServerSidePropsContext<ParsedUrlQuery, any> & ({
	store: Store<State, ActionType> & {
		dispatch: Dispatch<ActionType>;
	}
}) & ({
	redirect(destination?: string, message?: string): GetServerSidePropsResult<IPages<P>>
	session?: Session
	getUser: typeof getUser
	fetchAPI: <D = any>(url: string) => Promise<D>
})

type Callback<P extends {}> = (params: CallbackParams<P>) => Promise<GetServerSidePropsResult<IPages<P>>>

async function getUser(where?: Partial<UserAttribute>) {
	if (!where) return undefined;
	const user = await User.findOne({
		where
	});
	if (!user) return undefined;
	return user;
}

export class BackendError {
	status: number
	name?: string;
	message: string

	constructor(status: number, message: string, name?: string) {
		this.status = status;
		this.message = message
		this.name = name;
	}
}

async function checkUserCookie(portalid: string, session_group_id?: string) {
	const cookie = verifyToken<{ id?: number, userid?: number }>(portalid.replace("%3A", ":"), [30, 'day']);
	if (cookie && cookie.id && cookie.userid) {
		const session = await Session.findOne({
			where: {
				id: cookie.id,
				userid: cookie.userid,
				active: true,
				...session_group_id ? {session_group_id} : {}
			},
			include: [{
				model: User,
				where: {
					remove: false,
					block: false,
					suspend: false,
					active: true
				},
				required: true
			}, {
				model: SessionGroup,
				required: false
			}]
		})
		if (session) {
			await session.user.initUserRoles();
			return session;
		}
	}
	return undefined;
}

export default function wrapper<P extends {}>(callback: Callback<P>) {
	return wrapperRoot.getServerSideProps((store) => async (ctx) => {
		try {
			let session: Session | undefined;
			await getDatabase();
			const tmpSessGroupIdCookie = getCookie("_sg", {req: ctx.req, res: ctx.res});
			const sessGroupIdCookie = typeof tmpSessGroupIdCookie === "string" ? tmpSessGroupIdCookie : undefined;
			const sessGroupId = sessGroupIdCookie ? verifyToken<{ id?: string }>(sessGroupIdCookie.replace("%3A", ":"), [1, 'year'])?.id : undefined;
			const portalid = getCookie("portalid", {req: ctx.req, res: ctx.res});

			const date = getDayJs();
			if (typeof portalid === "string") {
				session = await checkUserCookie(portalid, sessGroupId)
				if (session && session.user) {
					stored(store, {user: {...session.user.toPagination(), session_id: session.id, session_group_id: session.session_group_id || undefined}})

					try {
						// SESSION
						let token: string | undefined = undefined;
						if (!date.isSame(session.sess_time, "day")) {
							await Session.update({sess_time: date.toDate()}, {where: {id: session.id}});
							token = createToken({id: session.id, userid: session.user.id})
							if (process.env.NODE_ENV === "development") setCookie("portalid", token, {req: ctx.req, res: ctx.res, sameSite: "lax", secure: false, domain: domainCookie, httpOnly: true, expires: date.add(2, 'year').toDate()})
							else setCookie("portalid", token, {req: ctx.req, res: ctx.res, sameSite: "lax", secure: true, domain: domainCookie, httpOnly: true, expires: date.add(30, 'day').toDate()})
						}

						// SESSION GROUP
						if (session.session_group && session.session_group_id && sessGroupIdCookie) {
							if (!date.isSame(session.session_group.sess_time, "day")) {
								token = createToken({id: session.session_group_id})
								await SessionGroup.update({sess_time: date.toDate()}, {where: {id: session.session_group_id}});
								token = date.isSame(session.session_group.sess_time, "day") ? sessGroupIdCookie : createToken({id: session.session_group_id});
								if (process.env.NODE_ENV === "development") setCookie("_sg", token, {req: ctx.req, res: ctx.res, sameSite: "lax", secure: false, domain: domainCookie, httpOnly: true, expires: date.add(2, 'year').toDate()})
								else setCookie("_sg", token, {req: ctx.req, res: ctx.res, sameSite: "lax", secure: true, domain: domainCookie, httpOnly: true, expires: date.add(1, 'year').toDate()})
							}
						}
					} catch {}
				} else stored(store, {user: null});
			} else stored(store, {user: null});

			const fetchAPI = async <D = any>(url: string) => {
				const internalToken = createToken({
					...(session ? {
						id: session.id,
						userid: session.userid
					} : {}),
					token: process.env.INTERNAL_SERVER_SECRET
				})
				try {
					const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
						headers: {
							'Pn-Internal-Portalnesia': internalToken,
							"Cookie": Object.entries(ctx.req.cookies).reduce((acc, [key, value]) => {
								if (value) acc.push(`${key}=${value}`)
								return acc;
							}, [] as string[]).join("; ")
						}
					})
					const data = await resp.json() as ResponseData<D>;
					if (!resp.ok || typeof data.error === 'object' && ('description' in data.error || 'name' in data.error)) {
						const message = typeof data.error === 'object' && 'description' in data.error ? data.error.description : data.message;
						const name = typeof data.error === 'object' && 'name' in data.error ? data.error.name : undefined;
						throw new BackendError(resp.status, message, name);
					}
					return data.data;
				} catch (e) {
					if (e instanceof AxiosError) {
						if (e?.response?.status !== 404) {
							const logData = {
								link: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
								token: internalToken,
								status: e?.response?.status,
								statusText: e?.response?.statusText,
								data: e?.response?.data,
								cause: e.cause,
								error_message: e.message
							}
							console.error("Err Response", JSON.stringify(logData, null, 2))
						}
						const message = e.response?.data?.error === "object" && 'description' in e.response?.data.error ? e.response?.data.error.description : (e.response?.data.message || "Something went wrong")
						throw new BackendError(e.response?.status || 503, message);
					}
					throw new BackendError(503, "Something went wrong");
				}
			}

			return await callback({store, redirect: redirect({req: ctx.req, res: ctx.res}), getUser, session, fetchAPI, ...ctx});
		} catch (err) {
			let status: number = 503;
			if (err instanceof BackendError) {
				if (err.status === 404) return redirect<IPages<P>>({req: ctx.req, res: ctx.res})();
				console.error("Store backend error", err)
				status = err.status
			} else if (err instanceof Error) {
				if (process.env.NODE_ENV !== 'production') console.log("store 241", err.message, err.stack)
				err = new BackendError(503, err.message);
				console.error("Store error", err)
			} else {
				console.error("Store unknown error", err)
				err = new BackendError(503, "Something went wrong");
			}
			if (ctx.res) {
				ctx.res.statusCode = status;
				if (status >= 500) ctx.res.setHeader('Retry-After', 3600);
			}
			throw err;
		}
	})
}