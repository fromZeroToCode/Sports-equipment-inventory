const isBrowser = typeof window !== "undefined" && typeof window.crypto !== "undefined";

const SECRET = isBrowser
	? process.env.NEXT_PUBLIC_SESSION_HASH_SECRET || "b3f5c2a1d9e4b78f6c2a9e0f3b4d1c2e5f6a7b8c9d0e1f2034a5b6c7d8e9f0a1"
	: process.env.SESSION_HASH_SECRET || "b3f5c2a1d9e4b78f6c2a9e0f3b4d1c2e5f6a7b8c9d0e1f2034a5b6c7d8e9f0a1";

function bufToHex(buf: ArrayBuffer | Uint8Array): string {
	const bytes = new Uint8Array(buf);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function browserHmacHex(keyStr: string, msg: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await window.crypto.subtle.importKey(
		"raw",
		enc.encode(keyStr),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);
	const sig = await window.crypto.subtle.sign("HMAC", key, enc.encode(msg));
	return bufToHex(sig);
}

async function nodeHmacHex(keyStr: string, msg: string): Promise<string> {
	const { createHmac } = await import("crypto");
	return createHmac("sha256", keyStr).update(msg).digest("hex");
}

function timingSafeCompareHex(aHex: string, bHex: string): boolean {
	if (!aHex || !bHex) return false;
	if (aHex.length !== bHex.length) return false;
	const a = new Uint8Array(aHex.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)));
	const b = new Uint8Array(bHex.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)));
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

export async function hashSession(value: string): Promise<string> {
	if (isBrowser) return browserHmacHex(SECRET, value);
	return nodeHmacHex(SECRET, value);
}

export async function verifySession(value: string, storedHexHash: string): Promise<boolean> {
	const expectedHex = await hashSession(value);
	if (isBrowser) {
		return timingSafeCompareHex(expectedHex, storedHexHash || "");
	}
	const { timingSafeEqual } = await import("crypto");
	const a = Buffer.from(expectedHex, "hex");
	const b = Buffer.from(storedHexHash || "", "hex");
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}
