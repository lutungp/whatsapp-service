export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    clientid : process.env.CLIENT_ID,
    darbelink_url: process.env.DARBELINK_URL || 'https://api-dev.internaldarbegroup.com'
});