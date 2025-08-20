export const registerSchema = {
    body:{
        type:'object',
        required:['password'],
        properties:{
            password:{
                type:'string',
                minLength:8,
                errorMessage:{
                    minLength:"Password is too short",
                }
            }
        }
    }
}