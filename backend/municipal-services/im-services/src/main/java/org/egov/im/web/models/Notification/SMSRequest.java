package org.egov.im.web.models.Notification;

import lombok.*;


@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class SMSRequest {
    private String Number;
    private String Text;
    private String SenderId="SELCOF";
    private String DRNotifyUrl="https://www.domainname.com/notifyurl";
    private String DRNotifyHttpMethod="POST";
    private String Tool="API";
}
