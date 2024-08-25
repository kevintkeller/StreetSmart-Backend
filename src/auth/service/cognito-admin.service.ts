import { HttpException, Injectable } from "@nestjs/common";
import AWS from "aws-sdk";
import { CognitoAuthService } from "./cognito-auth.service";
import { AdminUser } from "../models/admin-user.model";

@Injectable()
export class CognitoAdminService {
    private readonly cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
        region: 'us-east-1'
    });

    constructor(private cognitoAuthService: CognitoAuthService) {
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

    public async grantAdminStatus(username: string, userPoolId: string, groupName: string): Promise<boolean> {
        const isInGroup = await this.isUserInGroup(username, userPoolId, groupName);

        if (isInGroup) {
            return false;
        }

        const params = {
            UserPoolId: userPoolId,
            Username: username,
            GroupName: groupName
        };

        await this.cognitoIdentityServiceProvider.adminAddUserToGroup(params).promise();
        return true;
    }

    public async getAllAdmins(userPoolId: string, groupName: string): Promise<AdminUser[]> {
        let adminUsers: AdminUser[] = [];
        let nextToken: string | undefined;

        do {
            const params = {
                UserPoolId: userPoolId,
                GroupName: groupName,
                NextToken: nextToken
            };

            try {
                const response = await this.cognitoIdentityServiceProvider.listUsersInGroup(params).promise();
                if (response.Users) {
                    adminUsers = adminUsers.concat(response.Users.map(user => {
                        // Extracting the attributes
                        const nameAttr = user.Attributes?.find(attr => attr.Name === 'name');
                        const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
                        
                        // Construct the AdminUser object
                        return {
                            name: nameAttr ? nameAttr.Value : '',
                            email: emailAttr ? emailAttr.Value : '',
                            roles: [groupName] // Assuming the role is inferred from the group
                        };
                    }));
                }
                nextToken = response.NextToken;
            } catch (error) {
                console.error('Error listing users in group', error);
                throw new HttpException('Failed to fetch users', 500);
            }
        } while (nextToken);

        return adminUsers;
    }
}