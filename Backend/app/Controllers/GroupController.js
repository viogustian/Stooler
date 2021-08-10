import Controller from './controller';
import at from 'v-at'
import * as Exceptions from '../Exceptions/exceptions'
import Logger from '../Helpers/Logger';
import Validators from '../Validators/validators';
import GroupService from '../Services/groupService';
export default class AccountController extends Controller {
    constructor(response) {
      super(response);
      this.service = new GroupService();
    }

    createGroup (request) {
        // Logger.info("Creating Group");
        try{
            let {value,error} = Validators.groupCreate.validate(request.body);
            value.userId = request.params.uid;
            if(error){
                throw (new Exceptions.ValidationException(error.details[0].message));
            }     
            const addUser = this.service.createGroup(value);
            addUser.then(res => {
                this.sendResponse(res);
              })
              .catch (error => {
                this.handleException(error);
              }) 
        } catch (error) {
            // Logger.error("Error at creating group",error);
            this.handleException(error)
        }
    }

    userGroup (request) {
      // Logger.info("Joining Group");
      try{
          let {value,error} = Validators.groupJoin.validate(request.body);
          if(error){
              throw (new Exceptions.ValidationException(error.details[0].message));
          }     
          value.userId = request.params.uid;
          value.context = request.params.context;
          const addUser = this.service.userToGroup(value);
          addUser.then(res => {
              this.sendResponse(res);
            })
            .catch (error => {
              this.handleException(error);
            }) 
      } catch (error) {
          // Logger.error("Error at joining error",error);
          this.handleException({message:"Already a group member"})
      }
  }

    getGroups (request,obj) {
      try {
        const uid = request.params.uid;
        const promise  = this.service.getGroups(uid,request.body,obj);
        promise.then(res=>{
          this.sendResponse(res);
        }).catch(error =>{
          this.handleException(error);
        })
      } catch(error){
        this.handleException(error);
      }
    }

    getGroup (request) {
      try {
        let value = {_id:request.params.groupId};
        const promise  = this.service.getOwnGroup(value);
        promise.then(res=>{
          this.sendResponse(res);
        }).catch(error =>{
          this.handleException(error);
        })
      } catch(error){
        this.handleException(error);
      } 
    } 
    
    
    getMembers (request) {
      try {
        let value = {groupId:request.params.groupId};
        const promise  = this.service.getGroupMembers(value);
        promise.then(res=>{
          this.sendResponse(res);
        }).catch(error =>{
          this.handleException(error);
        })
      } catch(error){
        this.handleException(error);
      } 
    }
    
    
    getOwner (request) {
      try {
        let value = {groupOwner:request.params.uid};
        let promise;
        if(request.params.context == "getgroups"){
          promise  = this.service.getOwnedGroup(value);
        }else{
          value['_id'] =  request.body.gid;
          value['newOwner'] =  request.body.newOwner;
          promise  = this.service.transferOwnedGroup(value);
        }
        promise.then(res=>{
          this.sendResponse(res);
        }).catch(error =>{
          this.handleException(error);
        })
      } catch(error){
        this.handleException(error);
      } 
    }

}