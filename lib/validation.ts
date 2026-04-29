export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Email is required.";
  if (!/^\S+@\S+\.\S+$/.test(value)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/\d/.test(password)) return "Password should include at least one number.";
  return null;
}

export function validateDisplayName(name: string): string | null {
  const value = name.trim();
  if (!value) return "Display name is required.";
  if (value.length < 2) return "Name must be at least 2 characters.";
  return null;
}
