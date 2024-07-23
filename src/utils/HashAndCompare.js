import bcrypt from 'bcryptjs'
export const hashSync = ({ plaintext, salt = process.env.SALT_ROUND } = {}) => {
    const hashResult = bcrypt.hashSync(plaintext, parseInt(salt))
    return hashResult
}


export const compareSync = ({ plaintext, hashValue } = {}) => {
    const match = bcrypt.compareSync(plaintext, hashValue)
    return match
}