import './globals.css';

export const metadata = {
    title: 'CookApp - Share & Discover Amazing Recipes',
    description: 'A community-driven recipe sharing platform where you can discover, create, and cook amazing recipes.',
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#FF6B00',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
