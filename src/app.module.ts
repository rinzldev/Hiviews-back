import { join } from 'path';
// Mantener los paquetes de nest en la parte superior
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config/dist';
// Importacion de modulos
import { ReviewModule } from './review/review.module';
import { ThreadModule } from './thread/thread.module';
import { CommentModule } from './comment/comment.module';
import { TagModule } from './tag/tag.module';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { EnvConfiguration } from './config/env.config';
import { JoiValidationSchema } from './config/joi.validation';
import { MovieApiModule } from './movie-api/movie-api.module';
import { AppController } from './app.controller';
import { ProfileModule } from './profile/profile.module';
 

@Module({ 
  imports: [ 
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    ServeStaticModule.forRoot({ 
         rootPath: join(__dirname,'..','public'), 
    }), 
    // En esta parte se va configurar la conexion con la BD
    MongooseModule.forRoot(process.env.MONGODB, {
      dbName: 'hiviews-bd'
    }), 
    
    //Modulos
    AuthModule, ReviewModule, ThreadModule, CommentModule,
   TagModule, CategoryModule, MovieApiModule, ProfileModule,  
     
  ], 
  controllers:[
    AppController
  ]
  

}) 
export class AppModule {} 