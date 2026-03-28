import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  
  const isLoginPage = pathname === "/admin/login";
  const isAdminPath = pathname.startsWith("/admin");

  // Jika mencoba akses rute admin apapun
  if (isAdminPath) {
    // 1. Jika di halaman login dan sudah login, lempar ke dashboard
    if (isLoginPage && isLoggedIn) {
      return Response.redirect(new URL("/admin", req.nextUrl));
    }

    // 2. Jika di rute admin lain tapi belum login, paksa ke login
    if (!isLoginPage && !isLoggedIn) {
      return Response.redirect(new URL("/admin/login", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
