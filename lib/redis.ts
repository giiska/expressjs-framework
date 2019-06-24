import redis from 'redis'
// import {promisify} from 'util'
const redisClient = redis.createClient(6379);
// const getAsync = promisify(redisClient.get).bind(redisClient)
const defaultExpire = 2*60*60 //1h

redisClient.on('error', (err) => {
  console.log('redis Error:' + err);
})

export const rd = {
  set(key: String, expire?: number) {
    redisClient.set(key, true)
    redisClient.expire(key, expire || defaultExpire)
  },
  updateExpire(key: String, expire?: number) {
    redisClient.expire(key, expire || defaultExpire)
  },
  async get(key: String, callback?) {
    const data = await redisClient.get(key)
    // , (err, data) => {
    //   callback(data)
    // })
    return data
  },
  remove(key: String){
    redisClient.del(key)
  },
  // getAsync
}
