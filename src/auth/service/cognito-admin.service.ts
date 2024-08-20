import { Injectable } from "@nestjs/common";
import AWS from "aws-sdk";

@Injectable()
export class CognitoAdminService {
    private readonly cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
        region: 'us-east-1'
    });

    constructor() {
        AWS.config.update({ region: 'us-east-1' }); // Update with your region
    }
    
    public async isUserInGroup(username: string, userPoolId: string, groupName: string): Promise<boolean> {

        try {
            // Define the parameters for the API call
            const params = {
                UserPoolId: userPoolId,
                Username: username,
            };
    
            // Call the Cognito API to list groups for the user
            const response = await this.cognitoIdentityServiceProvider.adminListGroupsForUser(params).promise();
    
            // Check if the user is in the specified group
            return response.Groups.some(group => group.GroupName === groupName);
        } catch (error) {
            console.error('Error checking group membership', error);
            return false;
        }
    }
}