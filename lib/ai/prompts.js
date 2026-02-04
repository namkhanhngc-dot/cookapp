/**
 * Prompt templates cho các tính năng AI
 */

/**
 * Prompt cho Pantry Search - tìm công thức từ nguyên liệu
 */
export function pantrySearchPrompt(ingredients, recipes) {
    return `Bạn là chuyên gia ẩm thực Việt Nam. Nhiệm vụ của bạn là tìm công thức phù hợp nhất với nguyên liệu người dùng có sẵn.

NGUYÊN LIỆU CÓ SẴN:
${ingredients.join(', ')}

DANH SÁCH CÔNG THỨC:
${recipes.map((r, i) => `${i + 1}. ${r.title}
   Nguyên liệu: ${r.ingredients.map(ing => ing.name).join(', ')}
`).join('\n')}

YÊU CẦU:
- Tính % phù hợp cho mỗi công thức
- Xác định nguyên liệu khớp và thiếu
- Xếp hạng theo độ phù hợp cao nhất
- Giải thích ngắn gọn tại sao phù hợp
- Xử lý từ đồng nghĩa (ví dụ: "thịt bò" = "bò")

Trả về JSON array theo format:
{
  "matches": [
    {
      "recipe_id": number,
      "match_percentage": number,
      "matched_ingredients": string[],
      "missing_ingredients": string[],
      "explanation": string
    }
  ]
}`;
}

/**
 * Prompt cho Recipe Generator - tạo công thức mới
 */
export function recipeGeneratorPrompt(userPrompt, servings = 2) {
    return `Bạn là đầu bếp chuyên nghiệp ẩm thực Việt Nam. Hãy tạo một công thức nấu ăn hoàn chỉnh, chi tiết, dễ làm tại nhà.

YÊU CẦU NGƯỜI DÙNG: ${userPrompt}
SỐ NGƯỜI ĂN: ${servings}

QUY TẮC:
- Công thức phải phù hợp với người nấu ăn tại nhà
- Nguyên liệu dễ mua ở Việt Nam
- Các bước rõ ràng, dễ hiểu
- Thời gian thực tế
- Dùng đơn vị Việt Nam (gram, ml, thìa, chén, etc.)

Tạo công thức theo format JSON:
{
  "title": "Tên món ăn hấp dẫn",
  "description": "Mô tả ngắn về món",
  "servings": ${servings},
  "total_time_minutes": number,
  "difficulty": "easy|medium|hard",
  "ingredients": [
    {
      "name": "tên nguyên liệu",
      "amount": số lượng,
      "unit": "đơn vị"
    }
  ],
  "steps": [
    {
      "step": "Mô tả bước thực hiện",
      "estimated_minutes": thời gian ước tính cho bước này
    }
  ]
}`;
}

/**
 * Schema cho Recipe Generator output
 */
export const recipeGeneratorSchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        servings: { type: 'number' },
        total_time_minutes: { type: 'number' },
        difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard']
        },
        ingredients: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    amount: { type: 'number' },
                    unit: { type: 'string' }
                },
                required: ['name', 'amount', 'unit']
            }
        },
        steps: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    step: { type: 'string' },
                    estimated_minutes: { type: 'number' }
                },
                required: ['step', 'estimated_minutes']
            }
        }
    },
    required: ['title', 'servings', 'ingredients', 'steps', 'total_time_minutes', 'difficulty']
};

/**
 * Prompt cho Ingredient Substitution
 */
export function ingredientSubstitutePrompt(ingredient, recipeContext, count = 3) {
    return `Bạn là chuyên gia ẩm thực. Tìm ${count} nguyên liệu thay thế tốt nhất cho "${ingredient}" trong món "${recipeContext}".

YÊU CẦU:
- Nguyên liệu thay thế phải dễ tìm ở Việt Nam
- Giải thích tác động đến vị, mùi, kết cấu
- Cho tỷ lệ thay thế cụ thể
- Đánh giá độ tin cậy (0-1)

Trả về JSON:
{
  "substitutes": [
    {
      "name": "tên nguyên liệu thay thế",
      "explanation": "giải thích ngắn gọn",
      "confidence": number (0-1),
      "ratio": "tỷ lệ thay thế, vd: 1:1 hoặc 1:2"
    }
  ]
}`;
}

/**
 * Prompt cho Cook Mode Step Optimizer
 */
export function optimizeStepsPrompt(steps) {
    return `Bạn là chuyên gia huấn luyện nấu ăn. Nhiệm vụ: đơn giản hóa các bước nấu để dễ đọc khi nấu (hands-free).

CÁC BƯỚC GỐC:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

QUY TẮC:
- Mỗi bước tối đa 12 từ
- Bắt đầu bằng động từ hành động
- Không dùng mệnh đề phức tạp
- Tách các hành động dài thành nhiều bước nhỏ
- Giữ đủ thông tin quan trọng

Trả về JSON:
{
  "optimized_steps": [
    "Bước 1 đơn giản",
    "Bước 2 đơn giản",
    ...
  ]
}`;
}

/**
 * Prompt cho Auto-Tagging
 */
export function autoTagPrompt(recipe) {
    return `Phân tích công thức nấu ăn và tự động gắn thẻ phân loại.

TÊN MÓN: ${recipe.title}
MÔ TẢ: ${recipe.description || 'Không có'}
NGUYÊN LIỆU: ${recipe.ingredients?.map(i => i.name).join(', ') || 'Không rõ'}

Phân tích và gắn thẻ theo các category:
- dish_type: món chính, món phụ, soup, salad, dessert, etc.
- cuisine: vietnamese, chinese, japanese, western, fusion, etc.
- difficulty: easy, medium, hard
- cooking_method: boiling, frying, grilling, steaming, baking, etc.
- dietary: vegetarian, vegan, gluten-free, low-carb, healthy, etc.
- meal_time: breakfast, lunch, dinner, snack

Trả về JSON:
{
  "suggested_tags": {
    "dish_type": string,
    "cuisine": string,
    "difficulty": string,
    "cooking_method": string,
    "dietary": string[],
    "meal_time": string[],
    "confidence": number (0-1)
  }
}`;
}

export default {
    pantrySearchPrompt,
    recipeGeneratorPrompt,
    recipeGeneratorSchema,
    ingredientSubstitutePrompt,
    optimizeStepsPrompt,
    autoTagPrompt
};
