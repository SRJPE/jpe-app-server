const colors = {
  primary: '#337598',
  primaryDark: '#23516A',
  secondary: '#DDC9A3',
}

const styles = {
  header: `
    background: ${colors.primary};
    color: #e9f0f4;
    font-family: serif;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    padding: 1rem 2rem;
    gap: 1rem;
  `,
  headerLogo: `
    width: 200px;
    margin-right: 1rem;
  `,
  contentWrapper: `
    border: 1px solid rgba(45, 52, 54,1.0);
    border-radius: 5px;
    box-shadow: 4px 4px 10px rgba(0,0,0,.2);
    max-width: 678px;
    width: 100%;
  `,
  emailBody: `
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  linkButton: `
    color: white;
    text-decoration: none;
    display: inline-block;
    text-decoration: none;
    padding: 15px 30px;
    border: none;
    background: #337598;
    font-size: 16px;
    color: white;
    cursor: pointer;
    width: 150px;
    text-align: center;
    border-radius: 5px;
    margin-top: 1rem;
  `,
  textWrapper: `
    padding: 0 2rem;
  `,
  quoteBlock: `
    border-left: 5px solid ${colors.secondary};
    margin: 0;
  `,
  reviewComment: `
    padding: 15px;
    background: #eee;
    margin: 0
  `,
}

export default styles
