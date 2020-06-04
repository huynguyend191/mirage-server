INSERT INTO `mirage`.`accounts`
(`id`,
`username`,
`password`,
`role`, `state`, `verification`, `createdAt`, `updatedAt`)
VALUES
('fc3dbe11-6f70-4050-a466-e9a4a7a39f6b',
'admin',
'$2b$10$lzlJeEC.MHu0LqxIlpdtq.WZff4xExxcC0jYmysDYkcVOrOTlJsYi',
1, 1, 1, now(), now());

INSERT INTO `mirage`.`settings`
(`id`,
`type`,
`content`,
`createdAt`,
`updatedAt`)
VALUES
('359fd457-d921-41df-a32c-d352745ebcb5',
'student price',
'0.1',
now(),
now());

INSERT INTO `mirage`.`settings`
(`id`,
`type`,
`content`,
`createdAt`,
`updatedAt`)
VALUES
('28f0a12b-32e5-420d-a495-43639a19ba4e',
'tutor price',
'0.07',
now(),
now());

INSERT INTO `mirage`.`settings`
(`id`,
`type`,
`content`,
`createdAt`,
`updatedAt`)
VALUES
('ac3f021e-2466-4883-893e-9c1ef2bcb0cb',
'discount rate',
'{"NORMAL":1,"SILVER":0.85,"GOLD":0.75,"PLATIUM":0.65}',
now(),
now());

