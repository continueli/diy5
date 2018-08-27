<?php
class SqlModel extends CI_Model{
    function __construct(){
        parent::__construct();
        // $this->load->database();
    }
    public function search($table,$where){
        $this->db->where($where);
        $query=$this->db->get($table);
        return $query->result_array();
    }
    public function pageGet($table,$where=null,$start=1,$limit=10){
        $result=$this->db->get($table)->result_array();
        return $result;
    }
    public function findOne($table,$where){
        // $this->db->where($idmap['key'],$idmap['value']);
        $this->db->where($where);
        $this->db->select('*');
        $query=$this->db->get($table);
        $one=$query->row_array();
        return $one;
    }

    public function addData($table,$data){
        return $this->db->insert($table,$data);
    }

    public function modify($table,$data,$where){
        $this->db->where($where);
        return $this->db->update($table,$data);
    }

    public function remove($table,$idmap){
        if(is_array($idmap['value'])){
            $ids=implode($id, ',');
            $this->db->where($idmap['key'].' in','('.$idmap['value'].')');
            $this->db->delete($table,array($idmap['key'].' in','('.$idmap['value'].')'));
        }else{
            $this->db->delete($table,array($idmap['key'],$idmap['value']));
        }
    }

    public function selectby($table,$wheres,$orderby,$isdesc=''){
        $sql= "SELECT * from {$table} where {$wheres} order by {$orderby}".' '.$isdesc;
        // echo $sql;
        $query=$this->db->query($sql);
        return $query->result_array();
    }
}
?>
