CREATE TABLE [dbo].[users] (
    [userId]   INT           IDENTITY (1, 1) NOT NULL,
    [username] VARCHAR (100) NULL,
    [email]    VARCHAR (150) NULL,
    CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([userId] ASC)
);


GO

