// Generate Recipe Schema (JSON-LD) for SEO
function generateRecipeSchema(recipe) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        description: recipe.description || '',
        author: {
            '@type': 'Person',
            name: recipe.display_name || recipe.username
        },
        datePublished: recipe.created_at,
        prepTime: `PT${recipe.prep_time || 0}M`,
        cookTime: `PT${recipe.cook_time || 0}M`,
        totalTime: `PT${recipe.total_time || 0}M`,
        recipeYield: `${recipe.servings} servings`,
        recipeCategory: recipe.categories?.find(c => c.type === 'dish_type')?.name || '',
        recipeCuisine: '',
        keywords: recipe.categories?.map(c => c.name).join(', ') || '',
    };

    // Add image
    if (recipe.image_url) {
        schema.image = recipe.image_url;
    }

    // Add ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
        schema.recipeIngredient = recipe.ingredients.map(ing => {
            const parts = [];
            if (ing.quantity) parts.push(ing.quantity);
            if (ing.unit) parts.push(ing.unit);
            parts.push(ing.name);
            return parts.join(' ');
        });
    }

    // Add instructions
    if (recipe.instructions && recipe.instructions.length > 0) {
        schema.recipeInstructions = recipe.instructions.map(inst => ({
            '@type': 'HowToStep',
            text: inst.instruction,
            position: inst.step_number
        }));
    }

    // Add rating
    if (recipe.avg_rating && recipe.rating_count > 0) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: recipe.avg_rating.toFixed(1),
            ratingCount: recipe.rating_count
        };
    }

    // Add nutrition (placeholder for future)
    schema.nutrition = {
        '@type': 'NutritionInformation',
        calories: ''
    };

    return schema;
}

// Generate page metadata
function generateRecipeMeta(recipe) {
    return {
        title: `${recipe.title} - CookApp`,
        description: recipe.description || `A delicious recipe by ${recipe.display_name}`,
        openGraph: {
            title: recipe.title,
            description: recipe.description,
            type: 'article',
            images: recipe.image_url ? [{ url: recipe.image_url }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: recipe.title,
            description: recipe.description,
            images: recipe.image_url ? [recipe.image_url] : [],
        }
    };
}

module.exports = {
    generateRecipeSchema,
    generateRecipeMeta
};
