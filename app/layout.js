// import theme style scss file
import 'styles/theme.scss';

export const metadata = {
    title: 'Rentify'
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className='bg-light'>
                {children}
            </body>
        </html>
    )
}
