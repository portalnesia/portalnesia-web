import { ApiError } from '@design/hooks/api';
import { Without } from '@type/general';

type CustomPublicKeyCredentialUserEntity = Without<PublicKeyCredentialUserEntity,'id'> & ({
    id: string
})

type CustomPublicKey = Without<PublicKeyCredentialDescriptor,'id'> & ({
    id: string
})

export type CustomWebAuthn<D> = Without<D,'challenge'|'user'|'allowCredentials'> & ({
    challenge: string
}) & (D extends PublicKeyCredentialCreationOptions ? {user:CustomPublicKeyCredentialUserEntity} : {})
& (D extends PublicKeyCredentialRequestOptions ? {allowCredentials: CustomPublicKey[]} : {})

function coerceToBase64Url(thing: any){
    // Array or ArrayBuffer to Uint8Array
    if (Array.isArray(thing)) {
        thing = Uint8Array.from(thing);
    }

    if (thing instanceof ArrayBuffer) {
        thing = new Uint8Array(thing);
    }

    // Uint8Array to base64
    if (thing instanceof Uint8Array) {
        var str = "";
        var len = thing.byteLength;

        for (var i = 0; i < len; i++) {
            str += String.fromCharCode(thing[i]);
        }
        thing = window.btoa(str);
    }
    if (typeof thing !== "string") {
        throw new ApiError("Cannot get credentials");
    }
    //thing = thing.replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/g, "");
    return thing as string;
}

function coerceToArrayBuffer(thing: any) {
    if (typeof thing === "string") {
        // base64url to base64
        //thing = thing.replace(/-/g, "+").replace(/_/g, "/");

        // base64 to Uint8Array
        var str = window.atob(thing);
        var bytes = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        thing = bytes;
    }

    // Array to Uint8Array
    if (Array.isArray(thing)) {
        thing = new Uint8Array(thing);
    }

    // Uint8Array to ArrayBuffer
    if (thing instanceof Uint8Array) {
        thing = thing.buffer;
    }

    // error if none of the above worked
    if (!(thing instanceof ArrayBuffer)) {
        throw new ApiError("could not coerce to ArrayBuffer");
    }

    return thing;
}

export async function webauthnLogin(auth: CustomWebAuthn<PublicKeyCredentialRequestOptions>) {
    const allowCredentials = auth.allowCredentials.map(c=>{
        return {
            ...c,
            id:coerceToArrayBuffer(c.id)
        }
    })
    const publicKey = {
        ...auth,
        challenge:coerceToArrayBuffer(auth.challenge),
        allowCredentials
    }
    const credentials = await navigator.credentials.get({
        publicKey
    })

    if(credentials && 'rawId' in credentials) {
        const creds = credentials as PublicKeyCredential;
        const resp = creds.response as AuthenticatorAssertionResponse;
        const rawId = coerceToBase64Url(new Uint8Array(creds.rawId));
        const clientDataJSON = coerceToBase64Url(new Uint8Array(resp.clientDataJSON));
        const authenticatorData = coerceToBase64Url(new Uint8Array(resp.authenticatorData));
        const signature = coerceToBase64Url(new Uint8Array(resp.signature));
        const userHandle = resp.userHandle ? coerceToBase64Url(new Uint8Array(resp.userHandle)) : null;
        const response = {
            id:creds.id,
            rawId,
            type: creds.type,
            extensions: creds.getClientExtensionResults(),
            response:{
                clientDataJSON,
                authenticatorData,
                signature,
                ...(userHandle ? {
                    userHandle: userHandle
                } : {})
            }
        }
        return response;
    }
    return undefined;
}

export async function webauthnRegister(auth: CustomWebAuthn<PublicKeyCredentialCreationOptions>) {
    const user = auth.user;

    const publicKey = {
        ...auth,
        challenge:coerceToArrayBuffer(auth.challenge),
        user:{
            ...user,
            id:coerceToArrayBuffer(user.id)
        }
    }
    const credentials = await navigator.credentials.create({
        publicKey
    });
    if(credentials && 'rawId' in credentials) {
        const creds = credentials as PublicKeyCredential;
        const resp = creds.response as AuthenticatorAttestationResponse;
        const rawId = coerceToBase64Url(new Uint8Array(creds.rawId));
        const clientDataJSON = coerceToBase64Url(new Uint8Array(resp.clientDataJSON));
        const attestationObject = coerceToBase64Url(new Uint8Array(resp.attestationObject));
        creds.type
        const response = {
            id:creds.id,
            rawId,
            type:creds.type,
            extensions: creds.getClientExtensionResults(),
            response:{
                clientDataJSON: clientDataJSON,
                attestationObject: attestationObject
            }
        }
        return response;
    }
    return undefined;
}