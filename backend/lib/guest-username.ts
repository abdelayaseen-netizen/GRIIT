/** Same generator as challenges.create / handle_new_user (user_ + first 8 of uuid). */
export function guestUsername(userId: string): string {
  return `user_${userId.slice(0, 8)}`;
}
