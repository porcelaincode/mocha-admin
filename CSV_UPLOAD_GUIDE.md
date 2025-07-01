# Bulk User Upload Guide

This guide explains how to use the bulk upload feature to add multiple users to your dating app dashboard.

## Getting Started

1. Navigate to the **Users** section in your admin dashboard
2. Click the **"Bulk Upload Users"** button
3. Download the CSV template to get started with the correct format
4. Fill in your user data and upload the file

## CSV Format

### Required Fields
- **phoneNumber**: The user's phone number (required for authentication)

### Optional User Fields
- **name**: Full name of the user
- **email**: Email address
- **age**: Age in years (must be 18 or older)
- **bio**: Short biography
- **location**: City, State or location string
- **verified**: true/false - whether the user is verified
- **interests**: JSON array of interests like `["hiking", "photography"]`

### Adult Profile Fields (Optional)
- **seductionStyle**: playful_tease, mysterious_allure, dominant_edge, sensual_whisper
- **flameLevel**: mild_spark, hot_blaze, scorching_inferno
- **fantasyTrigger**: Text description
- **powerPlayPreference**: yes, no, maybe
- **topTurnOn**: Text description
- **kinkScore**: Number from 0-10
- **idealSetting**: Text description
- **encounterFrequency**: daily, weekly, monthly, sporadically
- **afterPassionUnwind**: Text description
- **spicyMediaComfort**: very, somewhat, not_at_all
- **consentImportance**: Number from 0-10
- **midnightCraving**: Text description
- **riskTolerance**: low, medium, high
- **distancePreference**: local, long_distance, both

### Photo Fields (Optional)
You can include up to 3 photos per user by providing direct URLs. The system will automatically download and upload these images to AWS S3 with CloudFront CDN:

- **photo1_url**: Direct URL to the first photo (will be downloaded and uploaded to AWS S3)
- **photo2_url**: Direct URL to the second photo (will be downloaded and uploaded to AWS S3)
- **photo3_url**: Direct URL to the third photo (will be downloaded and uploaded to AWS S3)

**Note**: The system supports common image formats (JPEG, PNG, GIF, WebP) and will automatically detect the format from the URL or content type. Images are served via CloudFront CDN for optimal performance.

## Example CSV Row

```csv
name,email,phoneNumber,age,bio,location,verified,interests,seductionStyle,flameLevel,photo1_url,photo2_url,photo3_url
"John Doe","john@example.com","+1234567890",25,"Love hiking and photography","New York, NY",true,"[""hiking"", ""photography""]","playful_tease","hot_blaze","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",""
```

## Tips for Success

1. **Use the template**: Always start with the downloaded CSV template to ensure proper formatting
2. **Phone numbers**: Ensure phone numbers are unique and include country code (e.g., +1234567890)
3. **JSON format**: For interests, use proper JSON array format: `["interest1", "interest2"]`
4. **Boolean values**: Use lowercase `true` or `false` for boolean fields
5. **Empty fields**: Leave empty fields blank or use empty quotes `""`
6. **Photo URLs**: Ensure photo URLs are publicly accessible and return valid images
7. **Image formats**: Supported formats include JPEG, PNG, GIF, and WebP
8. **Enums**: Use exact enum values as specified in the field descriptions

## Upload Process

1. The system will validate each row before insertion
2. Users will be marked as "dummy users" to distinguish from regular signups
3. Photos will be automatically downloaded from URLs and uploaded to AWS S3
4. Images will be processed, optimized, and served via CloudFront CDN
5. Images will be linked to their respective users in the database
6. You'll see a detailed report showing successful uploads and any errors
7. Failed rows will be listed with specific error messages

## Error Handling

Common errors and solutions:

- **"Phone number is required"**: Ensure phoneNumber field is not empty
- **"Failed to insert user"**: Check for duplicate phone numbers or invalid data formats
- **"Failed to download image"**: Check that photo URLs are publicly accessible
- **"Failed to upload to S3"**: AWS S3 configuration issue - contact administrator
- **Photo processing warnings**: Photos may fail while user creation succeeds (non-critical)

## Security Notes

- All uploaded users are marked as `isDummyUser: true` for tracking
- Users created via bulk upload will need to verify their accounts normally
- The system validates data types and required fields before insertion
- Images are uploaded to AWS S3 with proper metadata and served via CloudFront CDN
- S3 keys are generated with timestamps and random suffixes for uniqueness

## File Formats Supported

- `.csv` (Comma Separated Values)
- `.xls` (Excel 97-2003)
- `.xlsx` (Excel 2007+)

The system will automatically parse the file and convert it to the proper format for database insertion. 