<?php
class DealModel extends CI_Model{
    function __construct(){
        parent::__construct();
        // $this->load->database();
    }
    function lang($id=1){
        $data=$this->sqlModel->findOne('po_lang',array('id'=>$id));
        return $data;
    }


    function email($data,$mail)
    {

        $mail->CharSet = "UTF-8";
        $mail->IsHTML(true);
        if(isset($data['smtp']) && $data['smtp']===true)
        {
            $mail->IsSMTP();
            $mail->SMTPAuth   = true;
            $mail->Host       = $data['host'];
            $mail->Port       = $data['port'];
            $mail->Username   = $data['username'];
            $mail->Password   = $data['password'];
            if(isset($data['SMTPSecure']))
            {
                $mail->SMTPSecure = $data['SMTPSecure'];
            }
        }
        // if(isset($data['batchto']))
        // {
        //     foreach($data['batchto'] as $bto)
        //     {
        //         $mail->AddAddress($bto['email'], $bto['name']);
        //     }
        // }
        if(isset($data['to']))
        {
            $mail->AddAddress($data['to'], $data['to_name']);
        }
        $mail->SetFrom($data['from'],$data['from_name']);

        if(isset($data['cc']))
        {
            $mail->AddCC($data['cc'],$data['cc_name']);
        }
        if(isset($data['dd']))
        {
            $mail->AddBCC($data['dd'],$data['dd_name']);
        }
        $mail->Subject = $data['subject'];
        $mail->AltBody = 'To view the message, please use an HTML compatible email viewer!';
        $mail->MsgHTML(stripslashes($data['content']));

        if(isset($data['attachment']))
        {
            if(is_string($data['attachment']))
            {
                  $mail->AddAttachment($data['attachment']);
            }
            else if(is_array($data['attachment']))
            {
                foreach($data['attachment'] as $val)
                {
                    $mail->AddAttachment($val);
                }
            }
        }
        if($mail->Send())
        {
            return 1;
        }
        else
        {
            // return $mail->ErrorInfo;
            return 0;
        }

    }

}
?>
