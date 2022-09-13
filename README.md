
# JPE App Server Test



## Usage

This server uses node-postgres to make queries to our Azure DB directly.
The bulk of this functionality can be found in `src/db/index.ts`

```javascript
export default {
  query: (text: string, params: any[]) => pool.query(text, params),
}
```




## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`AZURE_HOST`

`AZURE_USER`

`AZURE_PASSWORD`

`AZURE_DB`


## Insomnia Testing

After spinning up the server, try sending a get request to `http://localhost:8000/azure-testing/agency`
to recieve this data from our DB

