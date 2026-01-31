export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: '비밀번호를 입력해주세요.' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.` };
  }

  return { valid: true };
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: '아이디를 입력해주세요.' };
  }

  if (username.length < 3) {
    return { valid: false, error: '아이디는 3자 이상이어야 합니다.' };
  }

  return { valid: true };
}
