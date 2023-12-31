import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User } from 'src/auth/entities/user.entity';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

@Injectable()
export class ProfileService {
  constructor(
    
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}


  async findAll() {
    try {
      const profile = await this.userModel.find({ status: true });
      return profile;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOne(term: string) {
    
    let profile: User
 
    
 
    // MongoID
    if( !profile &&isValidObjectId(term)) {
     profile = await this.userModel.findById(term)
    }
    // autor
    if (!profile) {
     profile = await this.userModel.findOne({username: term.toLocaleLowerCase().trim()})
    }
     
    //Para casos de no encontrar nada
     if(!profile)
       throw new NotFoundException(`profile with id, username"${term}" not found`) 
 
     return profile;
   }


  async findAllMatch(term: string) {
    const searchRegex = new RegExp(term, 'i'); // Case-insensitive partial match using regex

    const profiles = await this.userModel.find({
      $and: [
        { status: true },
        {
          $or: [
            { username: { $regex: searchRegex } },
            {
              $or: [
                { name: { $regex: searchRegex } },
                { surname: { $regex: searchRegex } },
              ],
            },
          ],
        },
      ],
    });

    if (!profiles || profiles.length === 0) {
      throw new NotFoundException(`No profiles found for the search term "${term}"`);
    }

    return profiles;
  }


   async update(profileId: string, updateProfileDto: UpdateUserDto) {
    try {
      const existingProfile = await this.userModel.findById(profileId);
  
      if (!existingProfile) {
        throw new NotFoundException(`Profile with ID "${profileId}" not found`);
      }
  
      if (!existingProfile.status) {
        throw new BadRequestException(`Profile with ID "${profileId}" is not active`);
      }
  
      // Ensure password and birthday are not updated
      if (updateProfileDto.password || updateProfileDto.birthday) {
        throw new BadRequestException('Password and birthday cannot be updated');
      }
  
      
      if (updateProfileDto.username) {
        const usernameTaken = await this.userModel.findOne({ username: updateProfileDto.username.toLowerCase() });
        if (usernameTaken && usernameTaken._id.toString() !== profileId) {
          throw new BadRequestException(`Username "${updateProfileDto.username}" is already taken`);
        }
        updateProfileDto.username = updateProfileDto.username.toLowerCase();
      }
  
      
      if (updateProfileDto.email) {
        const emailTaken = await this.userModel.findOne({ email: updateProfileDto.email.toLowerCase() });
        if (emailTaken && emailTaken._id.toString() !== profileId) {
          throw new BadRequestException(`Email "${updateProfileDto.email}" is already taken`);
        }
        updateProfileDto.email = updateProfileDto.email.toLowerCase();
      }
  
      const updatedProfile = await this.userModel.findByIdAndUpdate(profileId, updateProfileDto, { new: true });
  
      return {
        profile: updatedProfile,
        message: 'Profile updated successfully.',
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }
  

  async remove(profileId: string) {
    try {
      const existingProfile = await this.userModel.findById(profileId);

      if (!existingProfile) {
        throw new NotFoundException(`Review with ID "${profileId}" not found`);
      }

      if (!existingProfile.status) {
        throw new BadRequestException(`Review with ID "${profileId}" is already inactive`);
      }

      // Actualizar el campo status a false
      existingProfile.status = false;
      await existingProfile.save();

      return { message: 'Profile deactivated successfully' };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`User already exists in the database: ${JSON.stringify(error.keyValue)}`);
    }

    console.log(error);
    throw new InternalServerErrorException(`Can't create review - Check server logs`);
  }


}
