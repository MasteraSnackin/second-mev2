/**
 * Act module - Structured action judgment using SecondMe AI
 * Returns JSON responses for compatibility scoring, intent classification, etc.
 */

export interface CompatibilityScore {
  score: number; // 0-100
  reasoning: string;
  strengths: string[];
  challenges: string[];
}

export interface ActionControl {
  description: string;
  schema: Record<string, any>;
}

/**
 * Call SecondMe Act API for compatibility scoring
 */
export async function getCompatibilityScore(
  accessToken: string,
  user1Shades: string[],
  user2Shades: string[],
  user1Bio?: string,
  user2Bio?: string
): Promise<CompatibilityScore> {
  const actionControl: ActionControl = {
    description: '分析两个用户的兴趣标签和个人简介，判断他们的匹配度。返回 0-100 的分数，并说明原因、优势和潜在挑战。',
    schema: {
      type: 'object',
      properties: {
        score: {
          type: 'number',
          description: '匹配度分数 (0-100)',
          minimum: 0,
          maximum: 100,
        },
        reasoning: {
          type: 'string',
          description: '分数的详细说明',
        },
        strengths: {
          type: 'array',
          items: { type: 'string' },
          description: '匹配的优势和共同点',
        },
        challenges: {
          type: 'array',
          items: { type: 'string' },
          description: '可能的挑战或差异',
        },
      },
      required: ['score', 'reasoning', 'strengths', 'challenges'],
    },
  };

  const prompt = `请分析以下两位用户的匹配度：

用户 A 的兴趣标签：${user1Shades.join(', ')}
${user1Bio ? `用户 A 的简介：${user1Bio}` : ''}

用户 B 的兴趣标签：${user2Shades.join(', ')}
${user2Bio ? `用户 B 的简介：${user2Bio}` : ''}

请评估他们的匹配度，并提供详细的分析。`;

  const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/v2/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: prompt,
      stream: false,
      actionControl,
    }),
  });

  if (!response.ok) {
    throw new Error(`Act API failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Act API error: ${data.message || 'Unknown error'}`);
  }

  // Parse the JSON result from the response
  const result = data.data.result;

  if (typeof result === 'string') {
    return JSON.parse(result);
  }

  return result as CompatibilityScore;
}

/**
 * Generic Act API call with custom action control
 */
export async function callActAPI(
  accessToken: string,
  prompt: string,
  actionControl: ActionControl
): Promise<any> {
  const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/v2/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: prompt,
      stream: false,
      actionControl,
    }),
  });

  if (!response.ok) {
    throw new Error(`Act API failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Act API error: ${data.message || 'Unknown error'}`);
  }

  const result = data.data.result;

  if (typeof result === 'string') {
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }

  return result;
}
