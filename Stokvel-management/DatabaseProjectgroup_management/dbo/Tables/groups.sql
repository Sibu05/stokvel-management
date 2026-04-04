CREATE TABLE [dbo].[groups] (
    [groupId]            INT           IDENTITY (1, 1) NOT NULL,
    [name]               VARCHAR (50)  NOT NULL,
    [description]        TEXT          NULL,
    [contributionAmount] INT           NULL,
    [cycleType]          VARCHAR (15)  NULL,
    [payoutOrder]        VARCHAR (15)  NULL,
    [startDate]          DATE          NOT NULL,
    [status]             VARCHAR (15)  NOT NULL,
    [createdBy]          VARCHAR (100) NOT NULL,
    [FFKuserId]          INT           NOT NULL,
    CONSTRAINT [PK_groups] PRIMARY KEY CLUSTERED ([groupId] ASC),
    CONSTRAINT [FFKuserId] FOREIGN KEY ([FFKuserId]) REFERENCES [dbo].[users] ([userId])
);


GO

