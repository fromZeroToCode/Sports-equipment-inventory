export async function logoutUser() {
	try {
		document.cookie = `session=; path=/; max-age=0; samesite=Lax;`;
		localStorage.removeItem("currentUser");
		return true;
	} catch (error) {
		console.error("Error logging out:", error);
		return false;
	}
}
