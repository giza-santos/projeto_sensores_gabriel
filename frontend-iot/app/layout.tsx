import "./globals.css"

export const metadata = {
  title: "Dashboard IoT",
  description: "Sistema IoT com CRUD"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}