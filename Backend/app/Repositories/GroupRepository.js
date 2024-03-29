import GroupModel from "../Models/groupModel";
import UserModel from "../Models/userModel";
import SourceModel from "../Models/sourceModel";
import Transaction from "../Models/transaction";
import mongoose from 'mongoose';
mongoose.models = {GroupModel,UserModel}
import axios from 'axios';


export default class GroupRepository {
    async findUser (obj) {
        try {
            const found = await UserModel.findById(obj)
            return found;
        } catch (error) {
            throw error
        }
    }
    
    async editGroup (obj) {
        try {
            const found = await obj.save();
            return found;
        } catch (error) {
            throw error
        }
    }
    
    async findTransaction (obj) {
        try {
            const found = await Transaction.findOne(obj);
            return found;
        } catch (error) {
            throw error
        }
    }


    async findGroup (obj) {
        try {
            const found = await GroupModel.find(obj).populate('sources').populate('groupOwner');
            return found;
        } catch (error) {
            throw error
        }
    }
    
    async findOwnerGroup (obj) {
        try {
            const found = await GroupModel.find(obj);
            return found;
        } catch (error) {
            throw error
        }
    }
    
    async findGroupMembers (obj) {
        try {
            const found = await Transaction.find(obj).populate('userId').populate('groupId');
            return found;
        } catch (error) {
            throw error
        }
    }


    async addUserToGroup (args,verifyGroupId,verifyuserId) {
        try {
            args['type'] = 'ACTIVE';
            args['deposited_amount'] = verifyGroupId.amount;
            args['returned_amount'] = 0;
            args['due_amount'] = verifyGroupId.amount;
            if(args.amount < args.deposited_amount){
                throw {'message':'Insufficient funds','success':false};
            }
            delete args.amount;
            const newTransaction = new Transaction(args);
            var data = JSON.stringify({
                "requestID":newTransaction._id ,
                "amount": {
                  "currency": "INR",
                  "amount": verifyGroupId.amount
                },
                "transferCode": "ATLAS_P2M_AUTH",
                "debitAccountID": verifyuserId['accountholderbankID'],
                "creditAccountID": verifyGroupId['accountholderbankID'],
                "transferTime": Date.now(),
                "remarks": "Creating group",
                "attributes": {}
              });
              
              var config = {
                method: 'post',
                url: 'https://fusion.preprod.zeta.in/api/v1/ifi/140793/transfers',
                headers: { 
                  'accept': 'application/json; charset=utf-8', 
                  'Content-Type': 'application/json', 
                  'X-Zeta-AuthToken': process.env.XZetaAuthToken,
                },
                data : data
              };
              
            var result = await axios(config)
              .then(function (response) {
                return response.data;
              });
            
            newTransaction['transferID'] =result['transferID']
            const sess = await mongoose.startSession();
            sess.startTransaction();      
            await newTransaction.save(); 
            verifyGroupId.groupPayment.push(newTransaction._id); 
            verifyGroupId.members.push(verifyuserId._id);          
            verifyuserId.groups.push(verifyGroupId._id); 
            verifyuserId.transaction.push(newTransaction._id);
            await verifyuserId.save({ session: sess }); 

            await verifyGroupId.save({ session: sess }); 

            await sess.commitTransaction(); 
            return {'message':'Group Joined','success':true};
        } catch (error) {
            throw error;
        }
    }
    
    
    async removeUserFromGroup (args,verifyGroupId,verifyuserId) {
        try {
            var data = JSON.stringify({
                "requestID":args._id+"sa" ,
                "amount": {
                  "currency": "INR",
                  "amount": args.returned_amount
                },
                "transferCode": "ATLAS_P2M_AUTH",
                "debitAccountID": verifyGroupId['accountholderbankID'],
                "creditAccountID": verifyuserId['accountholderbankID'],
                "transferTime": Date.now(),
                "remarks": "Creating group",
                "attributes": {}
              });
              
              var config = {
                method: 'post',
                url: 'https://fusion.preprod.zeta.in/api/v1/ifi/140793/transfers',
                headers: { 
                  'accept': 'application/json; charset=utf-8', 
                  'Content-Type': 'application/json', 
                  'X-Zeta-AuthToken': process.env.XZetaAuthToken,
                },
                data : data
              };
              
            var result = await axios(config)
              .then(function (response) {
                return response.data;
              });
            args['transferID'] =result['transferID']
            const sess = await mongoose.startSession();
            sess.startTransaction();      
            await args.save(); 
            verifyGroupId.members.pull(verifyuserId._id);          
            verifyuserId.groups.pull(verifyGroupId._id); 
            await verifyuserId.save({ session: sess }); 
            await verifyGroupId.save({ session: sess }); 
            await sess.commitTransaction(); 
            if(!verifyGroupId.members.length){
                await verifyGroupId.remove();
            }
            return {'message':'Group Left','success':true};
        } catch (error) {
            console.log(error)
            throw error;
        }
    }


    async createGroup (obj) {
        const {groupName,description,genre,duration,amount,userId}=obj
        const groupModel = new GroupModel({groupName,
            description,
            genre,
            duration,
            amount,
            fund: amount,
            totalsum: amount,
            loss:0,
            profit_deal:[],
            loss_deal:[],
            members:[userId],
            groupOwner: userId,
            groupPayment:[],
            sources: [],
            dues:[],
        })
        let ownerDetails;
        try{
            ownerDetails = await UserModel.findById(userId);
            if(genre == 'Gold/Silver'){
                ownerDetails.shares[0]['amount']+=amount
            } if(genre == 'Stock'){
                ownerDetails.shares[1]['amount']+=amount
            } if(genre == 'Cryptocurrency'){
                ownerDetails.shares[2]['amount']+=amount
            } if(genre == 'Currency Exchange'){
                ownerDetails.shares[3]['amount']+=amount
            }

            var config = {
                method: 'get',
                url: `https://fusion.preprod.zeta.in/api/v1/ifi/140793/accounts/${ownerDetails['accountholderbankID']}/balance`,
                headers: { 
                  'accept': 'application/json; charset=utf-8', 
                  'X-Zeta-AuthToken': process.env.XZetaAuthToken,
                }
              };
              
              ownerDetails['funds']= await axios(config)
              .then(function (response) {
                return response.data.balance;
            })  

            
            if(ownerDetails.funds < amount){
                console.log(ownerDetails.funds)
                throw {'message':'Insufficient funda','success':false};
            }
            ownerDetails.funds -= amount;
            const newTransaction = new Transaction({deposited_amount:amount,returned_amount:0,due_amount:amount,result:0,groupId:groupModel['_id'],userId:ownerDetails['_id'],type:"ACTIVE"})
            groupModel.groupPayment.push(newTransaction._id);
            ownerDetails.transaction.push(newTransaction._id);
            var today = new Date();
            var dd = today.getDate()-1;
            var mm = today.getMonth() //January is 0!
            var yyyy = today.getFullYear();
            var data = JSON.stringify({
            "ifiID": process.env.ifiID,
            "formID": groupModel._id,
            "applicationType": "CREATE_ACCOUNT_HOLDER",
            "spoolID": "3deb5a70-311c-11ea-978f-2e728ce88125",
            "individualType": "REAL",
            "salutation": "",
            "firstName": groupName,
            "middleName": "",
            "lastName": "",
            "profilePicURL": "",
            "dob": {
                "year": yyyy,
                "month": mm,
                "day": dd-1
            },
            "gender": "",
            "mothersMaidenName": "",
            "kycDetails": {
                "kycStatus": "Full",
                "kycStatusPostExpiry": "KYC_EXPIRED",
                "kycAttributes": {},
                "authData": {
                "PAN": groupModel._id,
                },
                "authType": "PAN"
            },
            "vectors": [],
            "pops": [],
            "customFields": {}
            });
            var config = {
            method: 'post',
            url: 'https://fusion.preprod.zeta.in/api/v1/ifi/140793/applications/newIndividual',
            headers: { 
                'Content-Type': 'application/json', 
                'X-Zeta-AuthToken': process.env.XZetaAuthToken,
            },
            data : data
            };
            
            var reply = await  axios(config)
            .then(function (response) {
            return ((response.data));
            })
            var data = `{"accountHolderID": ${reply.individualID},  "name": ${genre}, "phoneNumber": +91${Math.trunc(Number((Date.now().toString()).slice(-11,-1)))}}`;
            var config = {
            method: 'post',
            url: `https://fusion.preprod.zeta.in/api/v1/ifi/140793/bundles/${process.env.bundleId}/issueBundle`,
            headers: { 
                'accept': 'application/json; charset=utf-8', 
                'Content-Type': 'application/json; charset=utf-8', 
                'X-Zeta-AuthToken':  process.env.XZetaAuthToken
            },
            data : data
            };
            
            var replyforaccount =await axios(config)
            .then(function (response) {
                return (response.data);
            })
            groupModel['accountholderbankID']=replyforaccount.accounts[0].accountID;
            groupModel['accountholderbank']=reply.individualID;

            console.log(groupModel['accountholderbankID'])

            var data = JSON.stringify({
              "requestID":newTransaction._id ,
              "amount": {
                "currency": "INR",
                "amount": amount
              },
              "transferCode": "ATLAS_P2M_AUTH",
              "debitAccountID": ownerDetails['accountholderbankID'],
              "creditAccountID": groupModel['accountholderbankID'],
              "transferTime": Date.now(),
              "remarks": "Creating group",
              "attributes": {}
            });
            
            var config = {
              method: 'post',
              url: 'https://fusion.preprod.zeta.in/api/v1/ifi/140793/transfers',
              headers: { 
                'accept': 'application/json; charset=utf-8', 
                'Content-Type': 'application/json', 
                'X-Zeta-AuthToken': process.env.XZetaAuthToken,
              },
              data : data
            };
            
            var result = await axios(config)
            .then(function (response) {
              return response.data;
            });
            newTransaction['transferID'] =result['transferID']
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await groupModel.save({ session: sess }); 
            await newTransaction.save({ session: sess }); 
            ownerDetails.groups.push(groupModel._id); 
            await ownerDetails.save({ session: sess }); 
            await sess.commitTransaction(); 
        } catch (error) {
            console.log(error)
            throw error
        }
        return {"success":true};
    }

}
