export function getRoleHomePath(role) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "SELLER") {
    return "/seller";
  }

  return "/profile";
}
