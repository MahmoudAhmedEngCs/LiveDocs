'use server'
import {nanoid} from 'nanoid';
import { liveblocks } from '../liveBlocks';
import { revalidatePath } from 'next/cache';
import { getAccessType, parseStringify } from '../utils';
import { redirect } from 'next/navigation';

export const createDocument = async ({userId, email}:CreateDocumentParams)=>{
  const roomId= nanoid(); 
   try {
    const metadata={
        creatorId: userId,
        email,
        title: 'untitled'
    }
    const usersAccesses: RoomAccesses = {
        [email]: ['room:write'] 
      };
      
    const room = await liveblocks.createRoom(roomId, {
        metadata,
        usersAccesses,
        defaultAccesses: []
      });
     
      
      revalidatePath('/')
      return parseStringify(room);
} catch (error) {
    console.log("error room", error);
    
}
}
export const getDocument = async ({roomId , userId}:{roomId:string, userId:string})=>{
  try {
      const room = await liveblocks.getRoom(roomId)
      const haveAccess = Object.keys(room.usersAccesses).includes(userId)
      if(!haveAccess){
        throw new Error("Access denied")
      }
      return parseStringify(room)
  } catch (error) {
    console.log("error room", error);
  }
}
export const updateDocument = async (roomId:string , title:string)=>{
  try {
    const updateRoom= await liveblocks.updateRoom(roomId,{
      metadata: {
        title}
    })
    revalidatePath(`document/${roomId}`)
    return parseStringify(updateRoom)
  } 
  catch (error) {
    console.log('erorr chang roomdoc name',error);
    
  }
}
export const getDocuments = async (email:string)=>{
  try {
      const rooms = await liveblocks.getRooms({userId: email})
   
      return parseStringify(rooms)
  } catch (error) {
    console.log("error rooms", error);
  }
}
export const updateDocumentAccess  = async ({roomId ,email,userType,updatedBy}:ShareDocumentParams)=>{
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    }
    const room = await liveblocks.updateRoom(roomId,{usersAccesses})
    if(room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email
        },
        roomId
      })
    }
    revalidatePath(`/documents/${roomId}`)
    return parseStringify(room)
  } catch (error) {
    console.log(error);
    
  }
}
export const removeCollaborator = async ({roomId,email}:{roomId:string, email:string})=>{
  try {
    const room = await liveblocks.getRoom(roomId)
    if (room.metadata.email==email){
      throw new Error('you cannot remove your self')
    }
    const updatedRoom= await liveblocks.updateRoom(roomId,{usersAccesses:{[email]:null}})
    revalidatePath(`/documents/${roomId}`)
    return parseStringify(updatedRoom)
  } catch (error) {
    console.log(error);
    
  }

}
export const deleteDocument = async (roomId: string, userEmail: string) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email !== userEmail) {
      throw new Error("You cannot delete this document because you are not the creator.");
    }

    await liveblocks.deleteRoom(roomId);
    revalidatePath('/');
    redirect('/');
  } catch (error) {
    throw error; 
  }
};
