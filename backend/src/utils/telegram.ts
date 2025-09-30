import crypto from 'crypto';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export function validateTelegramWebAppData(initData: string): TelegramUser | null {
  // In development, allow mock data
  if (process.env.NODE_ENV === 'development' && initData.startsWith('MOCK_')) {
    const mockId = parseInt(initData.split('_')[1]) || 12345;
    return {
      id: mockId,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
    };
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not set, skipping validation');
      return null;
    }

    // Parse init data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    if (!hash) {
      return null;
    }

    // Create data check string
    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Calculate secret key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Verify hash
    if (calculatedHash !== hash) {
      return null;
    }

    // Parse user data
    const userParam = params.get('user');
    if (!userParam) {
      return null;
    }

    const user: TelegramUser = JSON.parse(userParam);
    return user;
  } catch (error) {
    console.error('Telegram validation error:', error);
    return null;
  }
}
