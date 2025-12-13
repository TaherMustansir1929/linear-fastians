import chalk from "chalk";
import { format } from "date-fns";

const getTimestamp = () => {
  return chalk.gray(`[${format(new Date(), "HH:mm:ss")}]`);
};

const PREFIX = chalk.bold.magenta("⚡ APP");

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(
      `${getTimestamp()} ${PREFIX} ${chalk.blue("ℹ️  INFO")}    ${message}`,
      ...args
    );
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(
      `${getTimestamp()} ${PREFIX} ${chalk.yellow("⚠️  WARN")}    ${message}`,
      ...args
    );
  },
  error: (message: string, ...args: any[]) => {
    console.error(
      `${getTimestamp()} ${PREFIX} ${chalk.red("❌ ERROR")}   ${message}`,
      ...args
    );
  },
  success: (message: string, ...args: any[]) => {
    console.log(
      `${getTimestamp()} ${PREFIX} ${chalk.green("✅ SUCCESS")} ${message}`,
      ...args
    );
  },
  request: (method: string, path: string) => {
    console.log(
      `${getTimestamp()} ${PREFIX} ${chalk.cyan("🚀 START")}   ${chalk.bold(
        method
      )} ${path}`
    );
    console.log(chalk.gray("   │"));
  },
  response: (
    method: string,
    path: string,
    status: number,
    duration: string
  ) => {
    const statusColor =
      status >= 500
        ? chalk.red
        : status >= 400
        ? chalk.yellow
        : status >= 300
        ? chalk.cyan
        : chalk.green;

    console.log(chalk.gray("   │"));
    console.log(
      `${getTimestamp()} ${PREFIX} ${statusColor(
        status >= 400 ? "🛑 END  " : "🏁 END  "
      )}   ${chalk.bold(method)} ${path} ${statusColor(status)} ${chalk.gray(
        `(${duration})`
      )}`
    );
    console.log(chalk.gray("   ────────────────────────────────────────")); // Separator
  },
};

/**
 * Hono Middleware for logging requests
 */
import { Context, Next } from "hono";

export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const { method, path } = c.req;

  logger.request(method, path);

  try {
    await next();
  } catch (error) {
    // If next() throws (though Hono catches usually), log it
    // But we rely on Hono's onError mostly.
    // If it bubbles up here, it's serious.
    throw error;
  } finally {
    const end = Date.now();
    const duration = `${end - start}ms`;
    logger.response(method, path, c.res.status, duration);
  }
};

/**
 * Wrapper for Server Actions
 */
export const withLogging = <T extends any[], R>(
  actionName: string,
  action: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    logger.request("ACTION", actionName);

    try {
      const result = await action(...args);
      const end = Date.now();
      logger.response("ACTION", actionName, 200, `${end - start}ms`); // Assuming 200 for success
      return result;
    } catch (error) {
      const end = Date.now();
      logger.response("ACTION", actionName, 500, `${end - start}ms`);
      logger.error(`Action ${actionName} failed`, error);
      throw error;
    }
  };
};
