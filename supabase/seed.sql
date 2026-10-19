insert into workspace(id,name) values(1,'Kauri Office Demo') on conflict do nothing;
insert into cabinets(id,name,source_name) values
('10000000-0000-0000-0000-000000000001','Finance','Finance'),
('10000000-0000-0000-0000-000000000002','Operations','Operations') on conflict do nothing;
insert into retention_classes(id,name,years,basis,source) values
('20000000-0000-0000-0000-000000000001','unclassified',0,'Owner must choose a class and retention date','Local policy'),
('20000000-0000-0000-0000-000000000002','nz-tax',7,'Seven tax years after supplied tax-period end; extensions and exceptions require review','https://www.ird.govt.nz/records'),
('20000000-0000-0000-0000-000000000003','business-general',0,'Retention date set by the owner for the lawful business purpose','https://www.privacy.org.nz/privacy-principles/9/') on conflict do nothing;
insert into records(id,cabinet_id,name,class_id,document_date,period_end,retain_until,review_due,owner,personal,external_ref) values
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Supplier invoice March','20000000-0000-0000-0000-000000000002',current_date-40,current_date-30,current_date+2500,current_date-5,'Mere',false,'INV-104'),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Supplier invoice disputed','20000000-0000-0000-0000-000000000002',current_date-3000,current_date-2900,current_date-300,current_date-20,'Mere',false,'INV-099'),
('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','Former supplier contact list','20000000-0000-0000-0000-000000000003',current_date-800,null,current_date-60,current_date-15,'Aroha',true,'OPS-017'),
('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000002','Delivery docket archive','20000000-0000-0000-0000-000000000001',current_date-8,null,null,current_date-1,'Unassigned',false,'DOCKET-45'),
('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','Supplier service agreement','20000000-0000-0000-0000-000000000003',current_date-100,null,current_date+365,current_date+60,'Aroha',false,'AGR-10') on conflict do nothing;
insert into holds(id,record_id,name,reason,imposed_by) values('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','Supplier dispute','Preserve invoice and correspondence pending owner review','Demo legal reviewer') on conflict do nothing;
insert into tasks(id,record_id,name,owner,due) values('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000004','Obtain original delivery docket','Tane',current_date-3) on conflict do nothing;
