import { Request, Response, NextFunction } from 'express';

// Prompt Injection & Sensitive Data RegEx Patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /ignore all prior instructions/i,
  /disregard system prompt/i,
  /you are nowDAN/i,
  /bypass safety filters/i,
  /jailbreak mode/i,
  /reveal system instructions/i,
  /dump environment variables/i,
  /override security policy/i
];

const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b(?:\d[ -]*?){13,16}\b/, // Credit Card
  /xox[baprs]-[0-9a-zA-Z]{10,48}/, // Slack Token
  /sk-[a-zA-Z0-9]{32,64}/, // Generic Secret
];

export const aiSecurityGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    const prompt = req.body.prompt || req.query.prompt;

    if (prompt && typeof prompt === 'string') {
      // 1. Check Prompt Injection
      for (const pattern of PROMPT_INJECTION_PATTERNS) {
        if (pattern.test(prompt)) {
          return res.status(403).json({
            error: 'AI Security Alert: Prompt injection or malicious instruction attempt detected.',
            flagged: true,
            security_policy: 'Nexus AI Guardrail Rule #104'
          });
        }
      }

      // 2. Check PII / Secret Leakage
      for (const pattern of PII_PATTERNS) {
        if (pattern.test(prompt)) {
          return res.status(400).json({
            error: 'AI Security Warning: Sensitive PII or API secret detected in prompt. Please sanitize input.',
            flagged: true
          });
        }
      }
    }

    next();
  } catch (err: any) {
    next();
  }
};

export const sanitizeContent = (text: string): string => {
  if (!text) return '';
  let sanitized = text;
  PII_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED_SENSITIVE_DATA]');
  });
  return sanitized;
};
