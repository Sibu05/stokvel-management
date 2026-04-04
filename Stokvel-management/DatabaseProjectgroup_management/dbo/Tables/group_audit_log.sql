CREATE TABLE [dbo].[group_audit_log] (
    [group_audit_logId] INT          IDENTITY (1, 1) NOT NULL,
    [TFKgroupId]        INT          NOT NULL,
    [field]             VARCHAR (15) NOT NULL,
    [oldValue]          TEXT         NULL,
    [newValue]          TEXT         NULL,
    [changedAt]         DATE         NOT NULL,
    CONSTRAINT [PK_group_audit_log] PRIMARY KEY CLUSTERED ([group_audit_logId] ASC),
    CONSTRAINT [TFK] FOREIGN KEY ([TFKgroupId]) REFERENCES [dbo].[groups] ([groupId])
);


GO

