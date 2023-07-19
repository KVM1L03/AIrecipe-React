import React, { useState } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import ReactiveButton from 'reactive-button';
import ContentLoader from 'react-content-loader';

const Home = () => {
  const [productsText, setProductsText] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [caloriesText, setCaloriesText] = useState('');
  const [headingText, setHeadingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImage, setShowImage] = useState(true);

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const generateRecipe = async () => {
    setIsGenerating(true);
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Generate a recipe using the following products: ${productsText}. Make sure to include detailed instructions and a list of ingredients. Under the last line, give the number of calories in the form: 'Calories per serving: amount of calories.'`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const data = response.data;
      const recipe = data.choices[0].message.content.trim();
      const caloriesIndex = recipe.lastIndexOf('Calories per serving:');
      const recipeText = recipe.slice(0, caloriesIndex).trim();
      const recipeLines = recipeText.split('\n');

      const heading = recipeLines[0];
      const ingredientsStartIndex = recipeLines.findIndex((line) => line.toLowerCase().includes('ingredients:'));
      const instructionsStartIndex = recipeLines.findIndex((line) => line.toLowerCase().includes('instructions:'));

      const ingredients = recipeLines.slice(ingredientsStartIndex + 1, instructionsStartIndex);
      const instructions = recipeLines.slice(instructionsStartIndex + 1);

      const caloriesRegex = /:\s*(\d+)\s*calorie/;
      const caloriesMatch = recipe.match(caloriesRegex);
      const calories = parseInt(caloriesMatch[1]);

      setIngredients(ingredients);
      setInstructions(instructions);
      setCaloriesText(calories);
      setHeadingText(heading);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F5F5F7', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ margin: '1rem 0', marginTop: 1 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1D1D1F', textAlign: 'center' }}>
          Let AI generate a perfect recipe for you!
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <input
          type="text"
          value={productsText}
          onChange={(e) => setProductsText(e.target.value)}
          placeholder="Enter product names"
          style={{
            borderColor: '#13bf00',
            textAlign: 'center',
            borderWidth: '2px',
            padding: 20,
            borderRadius: '20px',
            marginTop: '4rem',
          }}
        />
        <ReactiveButton
          buttonState={isGenerating ? 'loading' : 'idle'}
          idleText="Submit"
          loadingText="Loading"
          successText="Ready !"
          onClick={generateRecipe}
          color="green"
          rounded
          style={{ marginTop: 20 }}
          size="large"
          shadow
        />

        {isGenerating ? (
          <div
            style={{
              margin: '1rem',
              marginTop: 40,
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
              padding: '1rem',
              width: '100%',
            }}
          >
            <ContentLoader
              speed={2}
              width={400}
              height={160}
              viewBox="0 0 400 160"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
              style={{ width: '100%', height: '100%' }}
            >
              <rect x="10" y="10" rx="3" ry="3" width="150" height="20" />
              <rect x="10" y="40" rx="3" ry="3" width="380" height="10" />
              <rect x="10" y="60" rx="3" ry="3" width="380" height="10" />
              <rect x="10" y="80" rx="3" ry="3" width="380" height="10" />
              <rect x="10" y="100" rx="3" ry="3" width="380" height="10" />
              <rect x="10" y="120" rx="3" ry="3" width="380" height="10" />
            </ContentLoader>
          </div>
        ) : ingredients.length > 0 && instructions.length > 0 ? (
          <div
            style={{
              margin: '1rem',
              marginTop: 40,
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                backgroundColor: '#212121',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
              }}
            >
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{headingText}</h3>
            </div>
            <div style={{ backgroundColor: '#ededef', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: 'column' }}>
              <div>
                <h4 style={{ color: '#212121', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ingredients:</h4>
                {ingredients.map((ingredient, index) => (
                  <p key={index} style={{ color: '#212121', fontSize: '1rem', margin: '0' }}>
                    {ingredient}
                  </p>
                ))}
              </div>
              <div>
                <h4 style={{ color: '#212121', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Instructions:</h4>
                {instructions.map((instruction, index) => (
                  <p key={index} style={{ color: '#212121', fontSize: '1rem', margin: '0' }}>
                    {instruction}
                  </p>
                ))}
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#212121',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                marginBottom: '1rem',
              }}
            >
              <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                {caloriesText} calories per serving
              </p>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 70, textAlign: 'center', display: showImage ? 'block' : 'none' }}>
            <img src="https://i.ibb.co/ZztkYBW/obraz-2023-07-18-214706959-removebg-preview.png" alt="nikocadoavocado" style={{ maxWidth: '300px', maxHeight: '300px' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
