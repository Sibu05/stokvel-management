CREATE TABLE [dbo].[group_members] (
    [FFKgroupId] INT          NOT NULL,
    [SFKuserId]  INT          NOT NULL,
    [role]       VARCHAR (10) NOT NULL,
    [joinedAt]   DATE         NOT NULL,
    CONSTRAINT [FFKgroupId] FOREIGN KEY ([FFKgroupId]) REFERENCES [dbo].[groups] ([groupId]),
    CONSTRAINT [SFKuserId] FOREIGN KEY ([SFKuserId]) REFERENCES [dbo].[users] ([userId])
);


GO

