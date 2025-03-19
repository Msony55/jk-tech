import { EnvironmentVariables } from './env.validation';

export interface Config {
  appEnv: string;
  port: string;
  db_url: string;
  at_secret?: string;
  rt_secret?: string;
  at_expiry: string;
  rt_expiry: string;
  otp_expiry_in_minutes: number;
  otp_digits: number;
  iss?: string;
}

export default (): Config => {
  const processEnv = process.env as unknown as EnvironmentVariables;
  return {
    appEnv: processEnv.NODE_ENV,
    port: processEnv.PORT || '3000',
    db_url: processEnv.DATABASE_URL,
    at_secret: processEnv.AT_SECRET,
    rt_secret: processEnv.RT_SECRET,
    at_expiry: processEnv.AT_EXPIRY || '60d',
    rt_expiry: processEnv.RT_EXPIRY || '60d',
    otp_expiry_in_minutes: processEnv.OTP_EXPIRY_IN_MINUTES || 5,
    otp_digits: processEnv.OTP_DIGITS || 6,
    iss: processEnv.ISS,
  };
};
