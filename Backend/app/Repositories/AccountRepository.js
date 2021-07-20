import UserModel from "../Models/userModel";

export default class AccountRepository {
    async findUsername(obj){
        try {
            const found = await UserModel.findOne({username:obj.username,panCard:obj.panCard,email:obj.email,number:obj.number,aadhar:obj.aadhar})
            return found;
        } catch (error) {
            return "error at finding"
        }
        return 
    }
    async addUser(obj){
            const {name,panNumber,aadhar,username,email,password,number}=obj
            const userModel = new UserModel({name,panNumber,aadhar,username,email,password,number})
            try{
                console.log(userModel)
                await userModel.save();
            } catch (error) {
                return "error at adding"
            }
            return {"success":true};
    }
}