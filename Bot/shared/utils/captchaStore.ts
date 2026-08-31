interface CaptchaChallenge {
  code: string;
  expiresAt: number;
}

const challenges = new Map<string, CaptchaChallenge>();

function createCaptcha(userId: string): string {
  const code = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  challenges.set(userId, {
    code,
    expiresAt: Date.now() + 5 * 60_000,
  });

  return code;
}

function verifyCaptcha(
  userId: string,
  answer: string,
): boolean {
  const challenge = challenges.get(userId);

  challenges.delete(userId);

  return Boolean(
    challenge &&
      challenge.expiresAt > Date.now() &&
      challenge.code === answer.trim().toUpperCase(),
  );
}

export {
  createCaptcha,
  verifyCaptcha,
};

export type {
  CaptchaChallenge,
};