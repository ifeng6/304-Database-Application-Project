Project Description

Summary:
Our project models a media review site where users can leave reviews for
movies or TV shows. Users may create posts on a discussion board or join
communities. Information related to a movie/TV show is also provided, such as
the crew members/studio that worked on the media.

Endpoints:
POST @ /initiate - resets, creates, and inserts data into all tables
POST @ /insertion - insertion into reviews
POST @ /deletion - deletion of community --> cascade with MemberOf relation
POST @ /update - update User: gender, age, email(unique)
POST @ /join - join Reviews and Media and return list of reviews for a given title
GET @ /groupby - aggregation group by --> number of reviews per user
GET @ /having - aggregation having --> crew members with at least two favourites
GET @ /nested - nested group by --> highest average rated media
POST @ /division - division --> get all users who reviewed all media of a genre given by user
POST @ /projection - project User: username, gender, age, email, date joined
POST @ /selection - selection of media: mID, title, genre, date released
