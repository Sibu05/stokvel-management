CREATE TABLE [dbo].[group_invites] (
    [group_inviteId] INT           IDENTITY (1, 1) NOT NULL,
    [SFKgroupId]     INT           NOT NULL,
    [token]          VARCHAR (150) NOT NULL,
    [email]          VARCHAR (150) NULL,
    [createdBy]      VARCHAR (100) NOT NULL,
    [createdAt]      DATE          NOT NULL,
    [usedAt]         DATE          NOT NULL,
    [status]         VARCHAR (10)  NOT NULL,
    CONSTRAINT [PK_group_invites] PRIMARY KEY CLUSTERED ([group_inviteId] ASC),
    CONSTRAINT [SFKgroupId] FOREIGN KEY ([SFKgroupId]) REFERENCES [dbo].[groups] ([groupId])
);


GO

