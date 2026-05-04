
import React from 'react';

const globalStyles = `
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
    line-height: 1.6;
}
.container {
    max-width: 600px;
    margin: 40px auto;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 20px;
    text-align: center;
    color: white;
    position: relative;
}
.header-warning {
    background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}
.header-danger {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}
.header-muted {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}
.header h1 {
    margin: 0;
    font-size: 24px;
}
.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid white;
    margin: -70px auto 10px;
    display: block;
    background-color: #fff;
    position: relative;
    z-index: 2;
}
.content {
    padding: 40px 30px;
    color: #333;
}
.content p {
    margin: 16px 0;
}
.content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    display: block;
    margin: 20px auto;
}
.button {
    display: inline-block;
    background: #667eea;
    color: white !important;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 6px;
    margin: 20px 0;
    font-weight: 600;
}
.button:hover {
    background: #5568d3;
}
.button-danger {
    background: #dc3545;
}
.button-danger:hover {
    background: #c82333;
}
.button-success {
    background: #28a745;
}
.button-success:hover {
    background: #218838;
}
.alert-box {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    padding: 16px;
    margin: 20px 0;
    border-radius: 4px;
}
.success-box {
    background: #d4edda;
    border-left: 4px solid #28a745;
    padding: 16px;
    margin: 20px 0;
    border-radius: 4px;
}
.danger-box {
    background: #f8d7da;
    border-left: 4px solid #dc3545;
    padding: 16px;
    margin: 20px 0;
    border-radius: 4px;
}
.code-box {
    background: #f8f9fa;
    border: 2px dashed #667eea;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    margin: 30px 0;
}
.code {
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 8px;
    color: #667eea;
    font-family: 'Courier New', monospace;
}
.footer {
    background: #f8f9fa;
    padding: 30px 20px;
    text-align: center;
    font-size: 12px;
    color: #666;
}
.footer a {
    color: #667eea;
    text-decoration: none;
}
@media only screen and (max-width: 600px) {
    .container {
        margin: 0;
        border-radius: 0;
    }
    .content {
        padding: 30px 20px;
    }
}
`;

interface BaseLayoutProps {
  children: React.ReactNode;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => (
  <html lang="pt-BR">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
    </head>
    <body>
      {children}
    </body>
  </html>
);

interface EmailContainerProps {
    headerContent: React.ReactNode;
    headerClass?: string;
    children: React.ReactNode;
    userAvatar?: string | null;
}

export const EmailContainer: React.FC<EmailContainerProps> = ({ headerContent, headerClass = '', children, userAvatar }) => (
    <div className="container">
        <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid #eee' }}>
            <a href="https://minhaherancadigital.com" target="_blank">
                <img src="https://minhaherancadigital.com/img/logo1.png" alt="Minha Herança Digital" style={{ width: '150px', height: 'auto', border: '0' }} />
            </a>
        </div>
        <div className={`header ${headerClass}`}>
            {headerContent}
        </div>
        {userAvatar && (
            <img src={userAvatar} alt="User Avatar" className="avatar" />
        )}
        <div className="content" style={{ paddingTop: userAvatar ? '10px' : '40px' }}>
            {children}
        </div>
        <div className="footer">
            <p><strong>Minha Herança Digital</strong></p>
            <p>Preservando memórias, conectando gerações</p>
            <p style={{ marginTop: '20px' }}>
                <a href="/pricing#faq">Ajuda</a> | 
                <a href="/politica-de-privacidade">Privacidade</a> | 
                <a href="/termos-de-uso">Termos de Uso</a> |
                <a href="/politica-de-cookies">Cookies</a> |
                <a href="/politica-de-reembolso">Reembolso</a>
            </p>
            <p style={{ marginTop: '20px' }}>© 2025 Minha Herança Digital. Todos os direitos reservados.</p>
            <div style={{ marginTop: '30px' }}>
                <img src="https://minhaherancadigital.com/img/kki.png" alt="Assinatura" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
        </div>
    </div>
);
